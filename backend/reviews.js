import connection from "./dbconnect.js";
import express from "express";
import isAuthenticated from "./middleware.js";

const router = express.Router();

// this doesnot need any authorisation
// get avg rating of properties for the frontend
router.get('/avg/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;

    const [rows] = await connection.query(
      `SELECT 
        ROUND(AVG(rating), 2) AS avg_rating,
        COUNT(*) AS total_reviews
       FROM reviews 
       WHERE property_id = ?`,
      [propertyId]
    );

    res.status(200).json({
      success: true,
      avg_rating: rows[0].avg_rating || 0,
      total_reviews: rows[0].total_reviews || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.use(isAuthenticated);

router.get('/fetch/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;

        // Using JOIN to fetch review details along with user name and email
        const [data] = await connection.execute(
            `SELECT 
                r.*, 
                u.name AS userName, 
                u.email AS userEmail 
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.property_id = ?`, 
            [propertyId]
        );

        res.status(200).json({ success: true, data: data });
        
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// POST /reviews/add
router.post('/add', async (req, res) => {
    try {
        const { property_id, rating, comment } = req.body;
        const user_id = req.userId; // from auth middleware

        if (!property_id || !rating || !comment) {
            return res.status(400).json({ message: "property_id, rating, and comment are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // ── Check user has a CONFIRMED booking for this property ──
        const [booking] = await connection.query(
            `SELECT id FROM bookings 
             WHERE user_id = ? AND property_id = ? AND status IN ('CONFIRMED', 'EXPIRED')
             LIMIT 1`,
            [user_id, property_id]
        );

        if (booking.length === 0) {
            return res.status(403).json({ 
                message: "You can only review a property you have a confirmed booking for" 
            });
        }
        // ─────────────────────────────────────────────────────────

        const result = await connection.query(
            `INSERT INTO reviews (property_id, user_id, rating, comment, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [property_id, user_id, rating, comment]
        );

        res.status(201).json({
            message: "Review added successfully",
            reviewId: result.insertId
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/search', async (req, res) => {
  try {
    const { propertyId } = req.query;
    const user_id = req.userId;

    if (!propertyId || !user_id) {
      return res.status(403).json({ message: "userId or propertyId is not valid" });
    }

    const [rows] = await connection.execute(
      `SELECT id FROM bookings 
       WHERE user_id = ? AND property_id = ? AND status = 'CONFIRMED'
       LIMIT 1`,
      [user_id, propertyId]
    );

    res.json({ exists: rows.length > 0 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;