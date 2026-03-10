import 'dotenv/config'; //must be first
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import connection from '../dbconnect.js';
import isAuthenticatedADMIN from './adminMiddleware.js';

const router = express.Router();

router.use(isAuthenticatedADMIN);

//Propertieshandling
router.get("/properties", async (req, res) => {
    try {
        const query = `
      SELECT id, host_id, title, city, status, created_at
      FROM properties
      ORDER BY 
        CASE 
          WHEN status = 'PENDING' THEN 1
          WHEN status = 'ACTIVE' THEN 3
          ELSE 2
        END,
        created_at DESC;
    `;
        const [rows] = await connection.execute(query);
        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Error fetching properties:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
router.get("/properties/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const propertyQuery = `
            SELECT 
                p.id, p.title, p.description, p.city, p.price_per_night,
                p.max_guests, p.rules, p.status, p.created_at,
                u.id AS host_id, u.name AS host_name, u.email AS host_email,
                u.is_blocked AS host_is_blocked, u.created_at AS host_joined_at
            FROM properties p
            JOIN users u ON p.host_id = u.id
            WHERE p.id = ?
        `;
        const [propertyRows] = await connection.execute(propertyQuery, [id]);

        if (propertyRows.length === 0) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // Get images
        const imagesQuery = `
            SELECT id, image_path, created_at
            FROM property_images
            WHERE property_id = ?
            ORDER BY created_at ASC
        `;
        const [imageRows] = await connection.execute(imagesQuery, [id]);

        const property = propertyRows[0];

        res.status(200).json({
            success: true,
            data: {
                id: property.id,
                title: property.title,
                description: property.description,
                city: property.city,
                price_per_night: property.price_per_night,
                max_guests: property.max_guests,
                rules: property.rules,
                status: property.status,
                created_at: property.created_at,
                images: imageRows,
                host: {
                    id: property.host_id,
                    name: property.host_name,
                    email: property.host_email,
                    is_blocked: property.host_is_blocked,
                    joined_at: property.host_joined_at,
                },
            },
        });
    } catch (err) {
        console.error("Error fetching property detail:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
router.patch("/properties/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowed = ["ACTIVE", "BLOCKED", "PENDING"];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${allowed.join(", ")}`,
            });
        }

        const [result] = await connection.execute(
            "UPDATE properties SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        res.status(200).json({
            success: true,
            message: `Property status updated to ${status}`,
        });
    } catch (err) {
        console.error("Error updating property status:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//Usershandling
router.get("/users", async (req, res) => {
    try {
        const query = `
      SELECT *
      FROM users
      ORDER BY id 
        
    `;
        const [rows] = await connection.execute(query);
        // console.log(rows[0]);
        res.status(200).json({
            success: true,
            data: rows,
        });
    }
    catch (error) {
        console.log(`Error at fetch the usersDetails for Admin ${console.log(error)}`)
    }
});
router.patch("/users/:id/block", async (req, res) => {
    try {
        const { id } = req.params;
        // Get current status
        const [row] = await connection.execute(
            "SELECT role FROM users WHERE id = ?", [id]
        );
        if (row[0].role === "ADMIN") { return res.status(403).json({ message: "U can't block admin" }) };

        const [rows] = await connection.execute(
            "SELECT is_blocked FROM users WHERE id = ?", [id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

        const newStatus = rows[0].is_blocked ? 0 : 1;

        await connection.execute(
            "UPDATE users SET is_blocked = ? WHERE id = ?", [newStatus, id]
        );

        res.status(200).json({ success: true, message: newStatus ? "User blocked" : "User unblocked" });
    } catch (error) {
        console.error("Error toggling block status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//Bookinghandling
router.get("/bookings", async (req, res) => {
    try {
        const query = `
            SELECT 
                b.id,
                b.guests,
                b.start_date,
                b.end_date,
                b.total_price,
                b.status,
                b.created_at,
                u.id             AS user_id,
                u.name           AS user_name,
                u.email          AS user_email,
                p.id             AS property_id,
                p.title          AS property_title,
                p.city           AS property_city,
                pay.status       AS payment_status,
                pay.provider     AS payment_provider,
                pay.payment_ref
            FROM bookings b
            JOIN users u        ON b.user_id = u.id
            JOIN properties p   ON b.property_id = p.id
            LEFT JOIN payments pay ON pay.booking_id = b.id
            ORDER BY b.created_at DESC
        `;

        const [rows] = await connection.execute(query);

        // Net revenue = sum of total_price where payment is SUCCESS
        const netRevenue = rows
            .filter(r => r.payment_status === "SUCCESS")
            .reduce((sum, r) => sum + Number(r.total_price), 0);

        res.status(200).json({
            success: true,
            net_revenue: netRevenue,
            data: rows,
        });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
//See all refunds data 
router.get("/refunds", async (req, res) => {
    try {
        const [rows] = await connection.execute(`
            SELECT 
                r.id              AS refund_id,
                r.amount,
                r.reason,
                r.status          AS refund_status,
                r.created_at      AS refund_requested_at,
                p.id              AS payment_id,
                p.amount          AS paid_amount,
                p.status          AS payment_status,
                p.provider        AS payment_provider,
                p.payment_ref,
                b.id              AS booking_id,
                b.start_date,
                b.end_date,
                b.guests,
                b.total_price,
                b.status          AS booking_status,
                u.id              AS user_id,
                u.name            AS user_name,
                u.email           AS user_email,
                pr.id             AS property_id,
                pr.title          AS property_title,
                pr.city           AS property_city
            FROM refunds r
            JOIN payments p    ON p.id = r.payment_id
            JOIN bookings b    ON b.id = p.booking_id
            JOIN users u       ON u.id = b.user_id
            JOIN properties pr ON pr.id = b.property_id
            ORDER BY r.created_at DESC
        `);

        const totalPending = rows.filter(r => r.refund_status === "PENDING").reduce((sum, r) => sum + Number(r.amount), 0);
        const totalProcessed = rows.filter(r => r.refund_status === "PROCESSED").reduce((sum, r) => sum + Number(r.amount), 0);

        res.status(200).json({
            success: true,
            counts: {
                total: rows.length,
                pending: rows.filter(r => r.refund_status === "PENDING").length,
                processed: rows.filter(r => r.refund_status === "PROCESSED").length,
            },
            amounts: {
                pending: totalPending,
                processed: totalProcessed,
            },
            data: rows,
        });

    } catch (err) {
        console.error("Error fetching refunds:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
//Months revenue
// Monthly revenue from payments
router.get("/revenue/monthly", async (req, res) => {
    try {
        const query = `
      SELECT
        MONTH(created_at) AS month,
        MONTHNAME(created_at) AS month_name,
        SUM(amount) AS revenue
      FROM payments
      WHERE status = 'SUCCESS'
      GROUP BY MONTH(created_at), MONTHNAME(created_at)
      ORDER BY MONTH(created_at)
    `;

        const [rows] = await connection.execute(query);

        // Normalize to all 12 months (important for charts)
        const monthMap = {
            Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, June: 0,
            July: 0, Aug: 0, Sept: 0, Oct: 0, Nov: 0, Dec: 0,
        };

        rows.forEach(r => {
            const shortMonth = r.month_name.slice(0, 3);
            monthMap[shortMonth] = Number(r.revenue);
        });

        const dataset = Object.entries(monthMap).map(([month, revenue]) => ({
            month,
            revenue: Number((revenue / 1000).toFixed(1)), // convert to K
        }));
        console.log(dataset);
        res.status(200).json({
            success: true,
            data: dataset,
        });

    } catch (err) {
        console.error("Monthly revenue error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
// Top 5 most booked cities (ACTIVE properties only)
router.get("/analytics/top-5-properties-percentage", async (req, res) => {
    try {
        const query = `
      WITH top_properties AS (
          SELECT 
              p.id,
              p.title,
              p.city,
              COUNT(b.id) AS total_bookings
          FROM properties p
          JOIN bookings b ON b.property_id = p.id
          WHERE p.status = 'ACTIVE'
            AND b.status NOT IN ('CANCELLED')
          GROUP BY p.id, p.title, p.city
          ORDER BY total_bookings DESC
          LIMIT 5
      )

      SELECT 
          id AS property_id,
          title,
          city,
          total_bookings,
          ROUND(
              (total_bookings / 
                  (SELECT SUM(total_bookings) FROM top_properties)
              ) * 100,
              2
          ) AS percentage_share
      FROM top_properties
      ORDER BY percentage_share DESC
    `;

        const [rows] = await connection.execute(query);

        res.status(200).json({
            success: true,
            data: rows,
        });

    } catch (err) {
        console.error("Top 5 percentage error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
//line chart % rate of bookings wrt to months ignoring the status of the booking and future and past 
router.get("/analytics/monthly-booking-percentage", async (req, res) => {
    try {
        const query = `
      WITH monthly_bookings AS (
          SELECT 
              MONTH(start_date) AS month_number,
              MONTHNAME(start_date) AS month_name,
              COUNT(*) AS total_bookings
          FROM bookings
          GROUP BY MONTH(start_date), MONTHNAME(start_date)
      )

      SELECT 
          month_number,
          month_name,
          total_bookings,
          ROUND(
              (total_bookings /
                  (SELECT COUNT(*) FROM bookings)
              ) * 100,
              2
          ) AS booking_percentage
      FROM monthly_bookings
      ORDER BY month_number
    `;

        const [rows] = await connection.execute(query);

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "June",
            "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];

        const monthMap = {};
        monthNames.forEach(m => monthMap[m] = 0);

        rows.forEach((r) => {
            const monthIndex = r.month_number - 1; // SQL month is 1–12
            monthMap[monthNames[monthIndex]] = Number(r.booking_percentage);
        });

        const dataset = monthNames.map(month => ({
            month,
            percentage: monthMap[month],
        }));

        res.status(200).json({
            success: true,
            data: dataset,
        });

    } catch (err) {
        console.error("Monthly booking % error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
export default router;