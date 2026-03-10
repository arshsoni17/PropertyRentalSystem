import { useParams } from "react-router";
import { useTimer } from 'react-timer-hook';
import MyTimer from "../timer";
const time = new Date();
time.setSeconds(time.getSeconds() + 300);
const Payment = () => {
    const { bookingId } = useParams();

    // Add this function
    const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };
    const payNow = async () => {


        
         const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            alert('Razorpay SDK failed to load');
            return;
        }
        // Step 2: Create order (route 1)
        const response = await fetch('http://localhost:3000/payment/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            body: JSON.stringify({ bookingId })
        });

        const order = await response.json();
        console.log("Order created:", order);

        // Step 3: Open Razorpay checkout
        const options = {
            key: "rzp_test_SHAzp7G0rme7Ef", // KEy can be public but key_secret muse be secret
            amount: order.amount,
            currency: order.currency,
            order_id: order.id,
            name: "Property Booking",
            description: `Booking #${bookingId}`,
            handler: async function (response) {
                // Step 4: After payment, verify (route 2)
                const verify = await fetch('http://localhost:3000/payment/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature
                    })
                });

                const result = await verify.json();
                if (result.status === 'success') {
                    alert('Payment successful!');
                    window.close(); // close payment tab
                } else {
                    alert('Payment verification failed');
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open(); // This opens the Razorpay payment modal
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
                    <p className="text-sm text-gray-500 mt-1">Booking ID: {bookingId}</p>
                </div>

                <div className="mb-6">
                    <MyTimer expiryTimestamp={time} />
                </div>

                <button
                    onClick={payNow}
                    className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition"
                >
                    Proceed to Pay
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                    Secured by Razorpay
                </p>
            </div>
        </div>
    )
}
export default Payment;