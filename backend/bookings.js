import connection from "./dbconnect.js";
import express from "express";
import isAuthenticated from "./middleware.js";
import { stat } from "node:fs";

const router = express.Router();

router.use(isAuthenticated);

router.post("/bookings", async (req, res) => {
    try {
        const userId = req.userId;
        const { propertyId, startDate, endDate, guests, totalPrice } = req.body;

        // console.log(`PPPPPPPPRRRRRRRRROOOOOOOPPPPPPPPEEEEEERRRRRTTTTTTYYYYYY ${propertyId}`);

        const [active] = await connection.execute(
            'SELECT status FROM properties WHERE id = ?',
            [propertyId]
        );
        if (active.length == 0) { return res.status(404).json({ message: "Property not found" }); }
        const state = active[0].status;
        // console.log(state);
        if (state === "PENDING" || state === "BLOCKED") {
            return res.status(403).json({ message: "This is either blocked or pending for approval" })
        }
        //examine the propertyId here that it should not be blocked or pending 


        // Validate input
        if (!propertyId || !startDate || !endDate || !guests) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({ message: "End date must be after start date" });
        }
        if (start < new Date()) {
            return res.status(400).json({ message: "Cannot book dates in the past" });
        }

        // Check if dates are already blocked
        const [blocked] = await connection.execute(
            `SELECT COUNT(*) as count FROM blocked_dates
             WHERE property_id = ? AND date BETWEEN ? AND ?`,
            [propertyId, startDate, endDate]
        );
        if (blocked[0].count > 0) {
            return res.status(400).json({ message: "Some dates are not available" });
        }

        const [property] = await connection.execute(
            'SELECT price_per_night, max_guests FROM properties WHERE id = ?',
            [propertyId]
        );

        if (!property.length) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (guests > property[0].max_guests) {
            return res.status(400).json({
                message: `Property allows maximum ${property[0].max_guests} guests. You requested ${guests} guests.`
            });
        }
        if (guests < 1) {
            return res.status(400).json({ message: "At least 1 guest is required" });
        }

        // Get property price if totalPrice not provided
        let finalPrice = totalPrice;
        if (!finalPrice) {
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            finalPrice = property[0].price_per_night * nights;
        }

        //  NEW: Set expiration time to 5 minutes from now
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Create booking with expires_at
        const [booking] = await connection.execute(
            `INSERT INTO bookings (user_id, property_id, start_date, end_date, guests, total_price, status, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
            [userId, propertyId, startDate, endDate, guests, finalPrice, expiresAt]
        );

        const bookingId = booking.insertId;

        // Create payment record with CREATED status
        const [payment] = await connection.execute(
            `INSERT INTO payments (booking_id, provider, amount, status)
             VALUES (?, 'RAZORPAY', ?, 'CREATED')`,
            [bookingId, finalPrice]
        );

        const paymentId = payment.insertId;

        // Temporarily block dates (will be removed if payment fails/expires)
        const dates = [];
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }
        for (const date of dates) {
            await connection.execute(
                `INSERT INTO blocked_dates (property_id, date, reason, booking_id)
                 VALUES (?, ?, 'booked', ?)`,
                [propertyId, date, bookingId]
            );
        }

        res.json({
            message: "Booking created. Please complete payment within 5 minutes.",
            bookingId,
            paymentId,
            totalPrice: finalPrice,
            nights: dates.length,
            guests,
            status: "PENDING",
            paymentStatus: "CREATED",
            expiresAt: expiresAt  // Return expiration time to frontend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/bookings/:bookingId/cancel", async (req, res) => {
    try {
        const userId = req.userId;
        const { bookingId } = req.params;
        const reason = "Change this ";

        const [booking] = await connection.execute(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
            [bookingId, userId]
        );

        if (!booking.length) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const currentStatus = booking[0].status;

        if (currentStatus === 'CANCELLED' || currentStatus === 'EXPIRED') {
            return res.status(400).json({
                message: `Booking is already ${currentStatus.toLowerCase()}`
            });
        }

        let refundAmount = 0;
        let refundPercentage = 0;
        let refundId = null;

        if (currentStatus === 'PENDING') {
            await connection.execute(
                `UPDATE payments SET status = 'FAILED' WHERE booking_id = ? AND status = 'CREATED'`,
                [bookingId]
            );
        }
        else if (currentStatus === 'CONFIRMED') {
            const [payment] = await connection.execute(
                'SELECT * FROM payments WHERE booking_id = ? AND status = "SUCCESS"',
                [bookingId]
            );

            if (!payment.length) {
                return res.status(400).json({ message: "No successful payment found for this booking" });
            }

            const checkInDate = new Date(booking[0].start_date);
            const today = new Date();
            const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));

            if (daysUntilCheckIn > 7) {
                refundPercentage = 100; // Full refund
            } else if (daysUntilCheckIn >= 3) {
                refundPercentage = 50; // 50% refund
            } else if (daysUntilCheckIn >= 1) {
                refundPercentage = 25; // 25% refund
            } else {
                refundPercentage = 0; // No refund
            }

            refundAmount = (booking[0].total_price * refundPercentage) / 100;

            // Insert refund record (if refund amount > 0)
            if (refundAmount > 0) {
                const [refund] = await connection.execute(
                    `INSERT INTO refunds (payment_id, amount, reason, status)
                     VALUES (?, ?, ?, 'PENDING')`,
                    [payment[0].id, refundAmount, reason || 'User cancellation']
                );

                refundId = refund.insertId;

                // Update payment status to REFUNDED
                await connection.execute(
                    `UPDATE payments SET status = 'REFUNDED' WHERE id = ?`,
                    [payment[0].id]
                );

                // TODO: Initiate actual refund with Razorpay
                // Once successful, update refund status to 'SUCCESS'
            }
        }

        // Update booking status to CANCELLED
        await connection.execute(
            `UPDATE bookings SET status = 'CANCELLED' WHERE id = ?`,
            [bookingId]
        );

        // Remove blocked dates
        await connection.execute(
            `DELETE FROM blocked_dates WHERE booking_id = ?`,
            [bookingId]
        );

        res.json({
            message: "Booking cancelled successfully",
            bookingStatus: currentStatus,
            refundPercentage,
            refundAmount,
            refundId,
            totalPrice: booking[0].total_price
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// NEW: Cleanup expired bookings route, it is added and we need token for this because we don't unnecessarily update if no one is logged in
// this only delete blocked dates of expired bookings nothing else
router.post("/cleanup-expired-bookings", async (req, res) => {
    try {
        const currentTime = new Date();

        // Find all expired PENDING bookings
        const [expiredBookings] = await connection.execute(
            `SELECT id FROM bookings 
            WHERE status = 'PENDING' 
            AND expires_at IS NOT NULL 
            AND expires_at <= ?`,
            [currentTime]
        );
        let expiredCount = 0;
        for (const booking of expiredBookings) {
            const bookingId = booking.id;
            // Update booking status to EXPIRED
            await connection.execute(
                `UPDATE bookings SET status = 'EXPIRED' WHERE id = ?`,
                [bookingId]
            );
            // Update payment status to FAILED
            await connection.execute(
                `UPDATE payments SET status = 'FAILED' 
                WHERE booking_id = ? AND status = 'CREATED'`,
                [bookingId]
            );
            // Remove blocked dates
            await connection.execute(
                `DELETE FROM blocked_dates WHERE booking_id = ?`,
                [bookingId]
            );
            expiredCount++;
        }
        // console.log(`Expired ${expiredCount} bookings at ${currentTime}`);
        res.json({
            message: "Cleanup completed",
            expired_count: expiredCount,
            timestamp: currentTime
        });
    } catch (error) {
        console.error("ERROR during cleanup:", error);
        res.status(500).json({ error: "Cleanup failed" });
    }
});

////////////////  lets user see the status of the refunds 
router.get("/user/refunds", async (req, res) => {
    try {
        const user_id = req.userId;

        const [refunds] = await connection.execute(
            `SELECT 
                r.id,
                r.payment_id,
                r.amount,
                r.reason,
                r.status,
                r.created_at,
                p.booking_id,
                p.amount AS paid_amount,
                b.start_date,
                b.end_date,
                b.guests,
                b.total_price,
                b.status AS booking_status,
                pr.title AS property_title,
                pr.city AS property_city,
                pr.id AS property_id
             FROM refunds r
             JOIN payments p ON p.id = r.payment_id
             JOIN bookings b ON b.id = p.booking_id
             JOIN properties pr ON pr.id = b.property_id
             WHERE b.user_id = ?
             ORDER BY r.created_at DESC`,
            [user_id]
        );

        res.json({ success: true, refunds, count: refunds.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});



/////// this is to handle error in 10th point that is user cna acces the blocked properties in its bookings table ifffff and only if it is authenticated
router.get("/:propertyId", async (req, res) => {
    try {
        const {propertyId} = req.params;

        //for accessing the host id
        const [hostId] = await connection.query(`
        SELECT host_id FROM properties WHERE id = ?`, [propertyId]);
        const host = hostId[0].host_id;
        console.log(`Host id = ${host}`);
        //
        //for accessing the host_Details
        const [hostDetails] = await connection.query(` SELECT name, email, created_at FROM USERS WHERE id = ?`,[host]);
        const host_name = hostDetails[0].name;
        const host_email = hostDetails[0].email;
        const host_joiningdate = hostDetails[0].created_at;
        // 
        //for accessing property details
        const [propertyDetails] = await connection.query(` SELECT title, description, city, price_per_night, max_guests, rules, created_at, status FROM properties WHERE id = ?`,[propertyId]);
        const pro_title = propertyDetails[0].title;
        const pro_description = propertyDetails[0].description;
        const pro_city = propertyDetails[0].city;
        const pro_price_per_night = propertyDetails[0].price_per_night;
        const pro_maxguests = propertyDetails[0].max_guests;
        const pro_rules = propertyDetails[0].rules;
        const pro_addedon = propertyDetails[0].created_at;
        const status = propertyDetails[0].status;
        // if( status ==="BLOCKED" ){ return res.status(403).json({message:"this property is blocked"})};
        // if( status === "PENDING"){ return res.status(403).json({message:"this property is not approved yet"})}
        // 
        //for accessing the blocked dates
        //block dates will be many therfore need array for them to store
        // we used array but for fetching loop will be used
        const [blockedDates] = await connection.query(` SELECT DATE_FORMAT(date, '%Y-%m-%d') as date, reason FROM blocked_dates where property_id = ?`,[propertyId]);

        // if( blockedDates.length != 0 ){}
        
        // 
        //for accessing imagesPaths
        const [imagesPaths] = await connection.query( `SELECT image_path FROM property_images WHERE property_id = ?`,[propertyId]);

        //
        res.json({ message: "property will be fetched", "hostId":hostId[0].host_id, "hostName":host_name, "host_email":host_email, "host_joiningdate":host_joiningdate, "pro_title":pro_title, 'pro_description':pro_description, 'pro_city':pro_city, 'pro_price_per_night':pro_price_per_night, 'pro_maxguests':pro_maxguests, 'pro_rules':pro_rules, 'pro_addedon':pro_addedon, blockedDates, imagesPaths
        })

    } catch (error) {
        return console.log(error);
    }

})
export default router;