import { useEffect, useState } from "react";

export const useRevenueDataset = () => {
  const [dataset, setDataset] = useState(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/admin/revenue/monthly",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token,
            },
          }
        );

        const data = await res.json();

        if (!data.success) {
          setDataset([]);
          return;
        }

        // Backend already sends formatted month + revenue in K
        setDataset(data.data);

      } catch (err) {
        console.error("Error fetching monthly revenue:", err);
        setDataset([]);
      }
    };

    fetchRevenue();
  }, []);

  return dataset;
};