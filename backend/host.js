import connection from './dbconnect.js'
import express from "express";

import multer from 'multer';

import isAuthenticated from './middleware.js';

import jwt from "jsonwebtoken";

import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET;
//
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const suffix = Date.now();
        cb(null, suffix + '-' + file.originalname);
    }
})
const upload = multer({ storage });
//
const router = express.Router();

router.use(isAuthenticated);

//this whole file will work if user is authenticated
router.put("/user-host", async (req, res) => {
    try {
        const user_id = req.userId;
        const user_name = req.userName;
        const user_role = req.userRole;
        if (user_role === 'HOST') {
            return res.json({ message: "Already a host" });
        }
        else {
            const [rows] = await connection.execute(
                "UPDATE users SET role = 'HOST' WHERE id = ?", [user_id]);
            //generate a new token with role of user set to host
            const token = jwt.sign({ userId: user_id, userName: user_name, userRole: 'HOST' }, JWT_SECRET)
            console.log(`"new token ${token}`);
            res.json({
                message: "user set to host, and new token is",
                token: token
            });
        }
    } catch (error) {
        console.error("ERROR:", error);
        res.status(401).json({ message: "no valid user" });
    }
});

router.post("/user-host-properties", upload.array('photos', 10), async (req, res) => {
    try {
        //we will check that a user must be an host for upload of properties
        const user = req.userRole;
        const userId = req.userId;

        const { title, description, city, price_per_night, max_guests, rules } = req.body;
        if (user === 'USER') {
            return res.status(403).json({ message: "u r not host" })
        }
        if (!title || !description || !city || !price_per_night || !max_guests) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one photo is required" });
        }

        // console.log("someporblemgfchj")
        const [result] = await connection.execute(
            `INSERT INTO properties (host_id, title, description, city, price_per_night, max_guests, rules)
            VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [userId, title, description, city, price_per_night, max_guests, rules]
        );
        // only one res.json() should bethere 
        // res.json({message:"property entry added successfully"});
        const propertyId = result.insertId;

        // console.log(propertyId);

        for (const file of req.files) {
            await connection.execute(
                'INSERT INTO property_images(property_id, image_path) VALUES (?,?)',
                [propertyId, file.path]
            );
        }
        res.json({
            message: "Property created successfully",
            propertyId: propertyId
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "someproblem" })
    }
});
//block dates manually by host
router.post("/block-dates", async (req, res) => {
    try {
        const userId = req.userId;
        const { propertyId, dates, reason } = req.body; // dates = ['2024-03-15', '2024-03-16']
        // Verify host owns this property
        if (!propertyId || !dates || !reason) { return res.status(403).json({ message: "missing fields" }) }
        const [property] = await connection.execute(
            'SELECT host_id FROM properties WHERE id = ?',
            [propertyId]
        );
        if (!property.length || property[0].host_id !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Block multiple dates
        for (const date of dates) {
            await connection.execute(
                `INSERT INTO blocked_dates (property_id, date, reason) 
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE reason = VALUES(reason)`,
                [propertyId, date, reason || 'host_blocked']
            );
        }
        res.json({ message: `${dates.length} date(s) blocked successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//unblock dates by host
router.delete("/unblock-dates", async (req, res) => {
    try {
        const userId = req.userId;
        const { propertyId, dates } = req.body;
        // Verify ownership
        const [property] = await connection.execute(
            'SELECT host_id FROM properties WHERE id = ?',
            [propertyId]
        );
        if (!property.length || property[0].host_id !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // Only unblock if reason is 'host_blocked', not 'booked'
        for (const date of dates) {
            await connection.execute(
                `DELETE FROM blocked_dates 
                 WHERE property_id = ? 
                 AND date = ? 
                 AND reason IN ('host_blocked', 'maintenance')`,
                [propertyId, date]
            );
        }
        res.json({ message: "Dates unblocked successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//get available properties
router.get("/availability/:propertyId", async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { startDate, endDate } = req.query;
        const [blockedDates] = await connection.execute(
            `SELECT date, reason
             FROM blocked_dates
             WHERE property_id = ? 
             AND date BETWEEN ? AND ?
             ORDER BY date`,
            [propertyId, startDate, endDate ]
        );
        res.json({
            propertyId,
            blockedDates,
            message: "All other dates are available"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/host/properties", async (req, res) => {
    try {
        const hostId = req.userId;

        const [properties] = await connection.execute(
            `SELECT
                p.id,
                p.title,
                p.description,
                p.city,
                p.price_per_night,
                p.max_guests,
                p.status,
                p.rules,
                p.created_at,
                COUNT(b.id)                                                     AS total_bookings,
                COALESCE(SUM(CASE WHEN b.status = 'CONFIRMED'
                                  THEN b.total_price ELSE 0 END), 0)            AS total_revenue
             FROM properties p
             LEFT JOIN bookings b ON b.property_id = p.id
             WHERE p.host_id = ?
             GROUP BY p.id
             ORDER BY p.created_at DESC`,
            [hostId]
        );

        res.json({ success: true, properties });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET /auth/host/properties/:propertyId/bookings
// One property (must be owned by host) + all its bookings with guest details
router.get("/host/properties/:propertyId/bookings", async (req, res) => {
    try {
        const hostId = req.userId;
        const { propertyId } = req.params;

        // Verify ownership
        const [propRows] = await connection.execute(
            `SELECT id, title, city, price_per_night, max_guests, status, created_at
             FROM properties WHERE id = ? AND host_id = ?`,
            [propertyId, hostId]
        );

        if (!propRows.length) {
            return res.status(404).json({ message: "Property not found or access denied" });
        }

        // All bookings with guest info joined from users table
        const [bookings] = await connection.execute(
            `SELECT
                b.id,
                b.user_id,
                b.start_date,
                b.end_date,
                b.guests,
                b.total_price,
                b.status,
                b.created_at,
                b.expires_at,
                u.email  AS user_email,
                u.name   AS guest_name        -- change 'name' to your actual column
             FROM bookings b
             LEFT JOIN users u ON u.id = b.user_id
             WHERE b.property_id = ?
             ORDER BY b.created_at DESC`,
            [propertyId]
        );

        res.json({
            success: true,
            property: propRows[0],
            bookings,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/user-host-properties/:propertyId/photos", upload.array('photos', 10), async (req, res) => {
    try {
        const userId = req.userId;
        const { propertyId } = req.params;

        // verify ownership
        const [property] = await connection.execute(
            'SELECT host_id FROM properties WHERE id = ?',
            [propertyId]
        );
        if (!property.length || property[0].host_id !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No photos provided" });
        }

        for (const file of req.files) {
            await connection.execute(
                'INSERT INTO property_images(property_id, image_path) VALUES (?, ?)',
                [propertyId, file.path]
            );
        }

        res.json({ message: `${req.files.length} photo(s) added successfully` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

router.delete("/user-host-properties/:propertyId/photos/:photoId", async (req, res) => {
    try {
        const userId = req.userId;
        const { propertyId, photoId } = req.params;

        // verify ownership
        const [property] = await connection.execute(
            'SELECT host_id FROM properties WHERE id = ?',
            [propertyId]
        );
        if (!property.length || property[0].host_id !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // get file path before deleting (to remove from disk)
        const [photo] = await connection.execute(
            'SELECT image_path FROM property_images WHERE id = ? AND property_id = ?',
            [photoId, propertyId]
        );
        if (!photo.length) {
            return res.status(404).json({ message: "Photo not found" });
        }

        // delete from DB
        await connection.execute(
            'DELETE FROM property_images WHERE id = ? AND property_id = ?',
            [photoId, propertyId]
        );

        // delete from disk
        const fs = require('fs');
        fs.unlink(photo[0].image_path, (err) => {
            if (err) console.log("File delete error:", err);
        });

        res.json({ message: "Photo deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
router.put("/user-host-properties/:propertyId", upload.array('photos', 10), async (req, res) => {
    try {
        const user = req.userRole;
        const userId = req.userId;
        const { propertyId } = req.params;

        const { title, description, city, price_per_night, max_guests, rules } = req.body;

        if (user === 'USER') {
            return res.status(403).json({ message: "u r not host" });
        }

        // verify host owns this property
        const [existing] = await connection.execute(
            'SELECT host_id FROM properties WHERE id = ?',
            [propertyId]
        );
        if (!existing.length || existing[0].host_id !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!title || !description || !city || !price_per_night || !max_guests) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // update property details
        await connection.execute(
            `UPDATE properties 
             SET title = ?, description = ?, city = ?, price_per_night = ?, max_guests = ?, rules = ?
             WHERE id = ? AND host_id = ?`,
            [title, description, city, price_per_night, max_guests, rules, propertyId, userId]
        );

        // if new photos uploaded, add them (existing photos stay)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await connection.execute(
                    'INSERT INTO property_images(property_id, image_path) VALUES (?, ?)',
                    [propertyId, file.path]
                );
            }
        }

        res.json({ message: "Property updated successfully", propertyId });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

//delete complete propertyId
router.delete("/user-host-properties/:propertyId", async (req, res) => {
    try {
        const userId = req.userId;
        const { propertyId } = req.params;

        // verify ownership
        const [property] = await connection.execute(
            'SELECT host_id FROM properties WHERE id = ?',
            [propertyId]
        );
        if (!property.length || property[0].host_id !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // check for future CONFIRMED or PENDING bookings
        const [activeBookings] = await connection.execute(
            `SELECT id FROM bookings 
             WHERE property_id = ? 
             AND status IN ('CONFIRMED', 'PENDING')
             AND end_date >= CURDATE()
             LIMIT 1`,
            [propertyId]
        );
        if (activeBookings.length > 0) {
            return res.status(400).json({ 
                message: "Cannot delete property with active or upcoming bookings. Wait for them to complete first." 
            });
        }

        // check for pending refunds
        // get all booking ids for this property first
        const [bookingIds] = await connection.execute(
            `SELECT id FROM bookings WHERE property_id = ?`,
            [propertyId]
        );

        if (bookingIds.length > 0) {
            const ids = bookingIds.map(b => b.id);
            const placeholders = ids.map(() => '?').join(',');

            const [pendingRefunds] = await connection.execute(
                `SELECT id FROM refunds 
                 WHERE payment_id IN (
                    SELECT id FROM payments WHERE booking_id IN (${placeholders})
                 ) 
                 AND status = 'PENDING'
                 LIMIT 1`,
                ids
            );
            if (pendingRefunds.length > 0) {
                return res.status(400).json({ 
                    message: "Cannot delete property with pending refunds. Wait for all refunds to be processed first." 
                });
            }
        }

        // get image paths before deleting
        const [photos] = await connection.execute(
            'SELECT image_path FROM property_images WHERE property_id = ?',
            [propertyId]
        );

        // single delete — cascade handles the rest
        await connection.execute('DELETE FROM properties WHERE id = ?', [propertyId]);

        // clean up image files from disk
        for (const photo of photos) {
            fs.unlink(photo.image_path, (err) => {
                if (err) console.log("File delete error:", err);
            });
        }

        res.json({ success: true, message: "Property deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// fecth the refunds status
router.get("/host/properties/:propertyId/pending-refunds", async (req, res) => {
    try {
        const userId = req.userId;
        const { propertyId } = req.params;

        // verify ownership
        const [property] = await connection.execute(
            'SELECT host_id FROM properties WHERE id = ?',
            [propertyId]
        );
        if (!property.length || property[0].host_id !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const [refunds] = await connection.execute(
            `SELECT 
                r.id,
                r.payment_id,
                r.amount,
                r.reason,
                r.status,
                r.created_at,
                p.booking_id,
                u.name AS guest_name,
                u.email AS guest_email
             FROM refunds r
             JOIN payments p ON p.id = r.payment_id
             JOIN bookings b ON b.id = p.booking_id
             JOIN users u ON u.id = b.user_id
             WHERE b.property_id = ? AND r.status = 'PENDING'
             ORDER BY r.created_at DESC`,
            [propertyId]
        );

        res.json({ success: true, refunds, count: refunds.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});



export default router;
