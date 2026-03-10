import 'dotenv/config';
import express from "express"
import cors from "cors";

import auth from "./auth.js";
import host from "./host.js";
import bookings from "./bookings.js";
import searchEngine from "./search.js";
import homebody from "./homebody.js";
import book from "./bookings.js";
import getpropertydetail from "./getProdetail.js";
import payment from "./gateway.js";

import adminRoutes from "./admin/routes.js";

import reviews from "./reviews.js";

const app = express();
app.use( express.json());

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

app.use( "/auth", auth);
app.use("/auth", host);
app.use("/auth", bookings);
app.use("/search", searchEngine );
app.use("/home", homebody);

app.use('/uploads', express.static('uploads'));

app.use('/property', book);
app.use('/propertyDetail', getpropertydetail);

app.use('/payment', payment);

app.use('/admin', adminRoutes);

app.use('/reviews', reviews);

app.get("/", (req, res)=>{
    res.json({message:"working new project"})
});
app.listen(3000);