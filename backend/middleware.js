import 'dotenv/config'
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET;

const isAuthenticated = (req, res, next)=>{
    const headerToken = req.headers.token;
    //to check error if any 
    //console.log(headerToken); 
    //
    if( ! headerToken){
        return res.json({
            message:"No Token"
        })
    }
    const decoded = jwt.verify( headerToken, JWT_SECRET);

    req.userId = decoded.userId;
    req.userName = decoded.userName;
    req.userRole = decoded.userRole;
    next();
};

export default isAuthenticated;

