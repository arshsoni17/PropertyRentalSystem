import express from "express";
import isAuthenticated from "./middleware.js";
import { createRazorpayInstance } from "./config/razorpay.config.js";
import connection from "./dbconnect.js";
import crypto from "crypto";

const razorpayInstance = createRazorpayInstance();
const router = express.Router();

router.use(isAuthenticated);

// Create order step 1st 
router.post("/create-order", async (req, res) => {
    const { bookingId } = req.body;

    try {
        const [booking] = await connection.execute(
            'SELECT total_price FROM bookings WHERE id = ?',
            [bookingId]
        );

        if (!booking.length) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const amount = booking[0].total_price;

        const options = {
            amount: amount * 100,
            currency: "INR"
        };

        razorpayInstance.orders.create(options, async (err, order) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Order creation failed" });
            }

            // Update payment record with order_id
            await connection.execute(
                'UPDATE payments SET payment_ref = ? WHERE booking_id = ?',
                [order.id, bookingId]
            );

            res.json(order);
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Verify payment
router.post("/verify-payment", async (req, res) => {
    const { order_id, payment_id, signature } = req.body;

    //validation of backend
    if( !order_id || !payment_id || !signature){
        return console.log("Missing data for verification of payment");
    }

    const body = order_id + '|' + payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === signature) {
        try {
            // Update payment status
            await connection.execute(
                'UPDATE payments SET payment_ref = ?, status = ? WHERE payment_ref = ?',
                [payment_id, 'SUCCESS', order_id]
            );

            // Update booking status
            const [payment] = await connection.execute(
                'SELECT booking_id FROM payments WHERE payment_ref = ?',
                [payment_id]
            );

            if (payment.length) {
                await connection.execute(
                    'UPDATE bookings SET status = ? WHERE id = ?',
                    ['CONFIRMED', payment[0].booking_id]
                );
            }

            res.json({ status: 'success' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Verification failed" });
        }
    } else {
        res.status(400).json({ status: 'failure' });
    }
});

export default router;