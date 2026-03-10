import 'dotenv/config'
import jwt from "jsonwebtoken"
import { error } from 'node:console';

const JWT_SECRET = process.env.JWT_SECRET;

const isAuthenticatedADMIN = (req, res, next)=>{
    const headerToken = req.headers.token;
    //to check error if any 
    // console.log(headerToken); 
    //
    if( ! headerToken){
        return res.json({
            message:"No Token"
        })
    }
    const decoded = jwt.verify( headerToken, JWT_SECRET);

    req.userId = decoded.userId;
    req.userName = decoded.userName;
    if(decoded.userRole == "ADMIN"){
        next();
    }
    else{
        return res.status(403).json({ message: "No access" });
    }
};

export default isAuthenticatedADMIN;

