import connection from './dbconnect.js'
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/properties/by-cities", async (req, res) => {
    try {
        const { maxGuests, minPrice, maxPrice, minRating, checkIn, checkOut } = req.query;

        let whereConditions = [`p.status = 'ACTIVE'`, `p.city IS NOT NULL`];
        let params = [];

        if (maxGuests) { whereConditions.push(`p.max_guests >= ?`); params.push(Number(maxGuests)); }
        if (minPrice) { whereConditions.push(`p.price_per_night >= ?`); params.push(Number(minPrice)); }
        if (maxPrice) { whereConditions.push(`p.price_per_night <= ?`); params.push(Number(maxPrice)); }
        if (checkIn && checkOut) {
            whereConditions.push(`p.id NOT IN (
                SELECT property_id FROM blocked_dates
                WHERE date BETWEEN ? AND ?
            )`);
            params.push(checkIn, checkOut);
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        const havingClause = minRating ? `HAVING AVG(r.rating) >= ${Number(minRating)}` : '';

        // get distinct cities matching filters
        const citiesQuery = `
            SELECT DISTINCT p.city
            FROM properties p
            LEFT JOIN reviews r ON r.property_id = p.id
            ${whereClause}
            GROUP BY p.city
            ${havingClause}
            ORDER BY p.city
        `;
        const [cities] = await connection.query(citiesQuery, params);

        const sections = [];

        for (let cityRow of cities) {
            const city = cityRow.city;

            const propertiesQuery = `
                SELECT
                    p.id,
                    p.host_id,
                    p.title,
                    p.description,
                    p.city,
                    p.price_per_night,
                    p.max_guests,
                    p.rules,
                    p.created_at,
                    (SELECT image_path
                     FROM property_images
                     WHERE property_id = p.id
                     ORDER BY created_at ASC
                     LIMIT 1
                    ) as image_path,
                    ROUND(AVG(r.rating), 1) as avg_rating,
                    COUNT(r.id)             as total_reviews
                FROM properties p
                LEFT JOIN reviews r ON r.property_id = p.id
                ${whereClause} AND p.city = ?
                GROUP BY p.id
                ${havingClause}
                ORDER BY p.created_at DESC
                LIMIT 7
            `;

            const cityParams = [...params, city];
            const [properties] = await connection.query(propertiesQuery, cityParams);

            if (properties.length > 0) {
                sections.push({
                    city,
                    section_title: `Properties in ${city}`,
                    total_count: properties.length,
                    properties,
                });
            }
        }

        res.status(200).json({ success: true, sections });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get("/city/:cityName", async (req, res) => {
    try {
        const { cityName } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { maxGuests, minPrice, maxPrice, minRating, checkIn, checkOut } = req.query;

        let whereConditions = [`p.city = ?`, `p.status = 'ACTIVE'`];
        let params = [cityName];

        if (maxGuests) { whereConditions.push(`p.max_guests >= ?`); params.push(Number(maxGuests)); }
        if (minPrice) { whereConditions.push(`p.price_per_night >= ?`); params.push(Number(minPrice)); }
        if (maxPrice) { whereConditions.push(`p.price_per_night <= ?`); params.push(Number(maxPrice)); }
        if (checkIn && checkOut) {
            whereConditions.push(`p.id NOT IN (
                SELECT property_id FROM blocked_dates
                WHERE date BETWEEN ? AND ?
            )`);
            params.push(checkIn, checkOut);
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        const havingClause = minRating ? `HAVING AVG(r.rating) >= ${Number(minRating)}` : '';

        // count with filters
        const countQuery = `
            SELECT COUNT(*) as total FROM (
                SELECT p.id, ROUND(AVG(r.rating), 1) as avg_rating
                FROM properties p
                LEFT JOIN reviews r ON r.property_id = p.id
                ${whereClause}
                GROUP BY p.id
                ${havingClause}
            ) as filtered
        `;
        const [countResult] = await connection.query(countQuery, params);
        const totalProperties = countResult[0].total;
        const totalPages = Math.ceil(totalProperties / limit);

        const propertiesQuery = `
            SELECT
                p.id,
                p.host_id,
                p.title,
                p.description,
                p.city,
                p.price_per_night,
                p.max_guests,
                p.rules,
                p.created_at,
                (SELECT image_path
                 FROM property_images
                 WHERE property_id = p.id
                 ORDER BY created_at ASC
                 LIMIT 1
                ) as image_path,
                ROUND(AVG(r.rating), 1) as avg_rating,
                COUNT(r.id)             as total_reviews
            FROM properties p
            LEFT JOIN reviews r ON r.property_id = p.id
            ${whereClause}
            GROUP BY p.id
            ${havingClause}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [properties] = await connection.query(propertiesQuery, [...params, limit, offset]);

        res.status(200).json({
            success: true,
            city: cityName,
            total_properties: totalProperties,
            current_page: page,
            total_pages: totalPages,
            properties_per_page: limit,
            properties,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch properties', error: error.message });
    }
});

// ======= unchanged routes below =======

router.get("/userProfile", async (req, res) => {
    const headerToken = req.headers.token;
    const decoded = jwt.verify(headerToken, JWT_SECRET);
    const userId = decoded.userId;
    const [rows] = await connection.query(
        "SELECT email, is_verified FROM users WHERE id = ?", [userId]
    );
    res.json({ email: rows[0].email, is_verified: rows[0].is_verified });
});

router.get("/userBookings", async (req, res) => {
    const headerToken = req.headers.token;
    const decoded = jwt.verify(headerToken, JWT_SECRET);
    const userId = decoded.userId;
    const [rows] = await connection.query(
        "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC", [userId]
    );
    res.json({ rows });
});

export default router;