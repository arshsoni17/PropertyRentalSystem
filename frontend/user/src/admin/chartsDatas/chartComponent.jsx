import { LineChart } from "@mui/x-charts";
import { useMonthlyBookingPercentage } from "./chart";
import LoadingPreview from "../../loadingPage";

const MonthlyBookingLine = () => {
  const data = useMonthlyBookingPercentage();

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingPreview />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        Monthly Booking Percentage (%)
      </h2>

      <LineChart
        dataset={data}
        xAxis={[{ scaleType: "band", dataKey: "month" }]}
        series={[
          {
            dataKey: "percentage",
            label: "Booking %",
          },
        ]}
        height={350}
      />
    </div>
  );
};

export default MonthlyBookingLine;