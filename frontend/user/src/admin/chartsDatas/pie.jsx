import { useEffect, useState } from "react";

export const useTopPropertiesPercentage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:3000/admin/analytics/top-5-properties-percentage",
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

        // Convert to MUI Pie format
        const formatted = result.data.map((item) => ({
          id: item.property_id,
          value: item.percentage_share,
          label: `${item.title} (${item.city})`,
        }));

        setData(formatted);

      } catch (err) {
        console.error("Pie chart fetch error:", err);
        setData([]);
      }
    };

    fetchData();
  }, []);

  return data;
};