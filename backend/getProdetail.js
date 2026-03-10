import express from "express";
import connection from './dbconnect.js';

const router = express.Router();

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
        if( status ==="BLOCKED" ){ return res.status(403).json({message:"this property is blocked"})};
        if( status === "PENDING"){ return res.status(403).json({message:"this property is not approved yet"})}
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