import { useEffect, useRef } from "react";

const BASEURL = "http://localhost:3000";

function BookingCleanupTimer() {
    const intervalRef = useRef(null);

    useEffect(() => {
        // Function to call cleanup endpoint
        const cleanupExpiredBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Only run cleanup if user is logged in
                if (!token) {
                    console.log("No token found, skipping cleanup");
                    return;
                }

                console.log("Running booking cleanup...");
                
                const response = await fetch(`${BASEURL}/auth/cleanup-expired-bookings`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "token": token  //Send token in header
                    }
                });

                const data = await response.json();
                
                if (response.ok) {
                    if (data.expired_count > 0) {
                        console.log(`Cleanup completed: ${data.expired_count} bookings expired`);
                        console.log(`Expired booking IDs: ${data.booking_ids.join(', ')}`);
                    } else {
                        console.log(" Cleanup completed: No expired bookings");
                    }
                } else {
                    console.error(" Cleanup failed:", data.error || data.message);
                }
            } catch (error) {
                console.error(" Error during cleanup:", error);
            }
        };

        // Run cleanup immediately on mount
        cleanupExpiredBookings();

        // Set interval to run every 5 minutes (300000 milliseconds)
        intervalRef.current = setInterval(cleanupExpiredBookings, 1 * 60 * 1000);

        console.log("Booking cleanup timer started (runs every 1 minutes)");

        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                console.log("Booking cleanup timer stopped");
            }
        };
    }, []);

    return null; 
}

export default BookingCleanupTimer;