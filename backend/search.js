//search by city 
// filter by price, filter by max_guests, added on
// filter by available_dates and sort by rating

//we don't use the authentication token here for search by cities not required

import connection from "./dbconnect.js";
import express from "express";
import isAuthenticated from "./middleware.js";

const router = express.Router();

router.get('/cities', async (req, res) => {
  try {
    const { q } = req.query; 

    if (!q || q.length < 1) {
      return res.json([]);
    }

    const query = 'SELECT DISTINCT city FROM properties WHERE city LIKE ? LIMIT 10';
    const searchTerm = `${q}%`; 

    const [results] = await connection.execute(query, [searchTerm]);
    
    const cityList = results.map(row => row.city);
    
    res.json(cityList);
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get( '/working', async(req,res)=>{
    try{
        return res.json( {message: " working"});
    }
    catch(error){
        console.log(error);
    }
});

export default router;