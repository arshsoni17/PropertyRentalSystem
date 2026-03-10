import { useEffect, useState } from "react";

export const useMonthlyBookingPercentage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/admin/analytics/monthly-booking-percentage",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token,
            },
          }
        );

        const result = await res.json();

        if (!result.success) {
          setData([]);
          return;
        }

        // Ensure numbers (not strings)
        const formatted = result.data.map((item) => ({
          month: item.month,
          percentage: Number(item.percentage),
        }));

        setData(formatted);

      } catch (err) {
        console.error("Line chart fetch error:", err);
        setData([]);
      }
    };

    fetchData();
  }, []);

  return data;
};