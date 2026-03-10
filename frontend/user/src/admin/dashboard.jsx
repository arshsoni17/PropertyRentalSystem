import { useRevenueDataset } from "./chartsDatas/bar";
import TopPropertiesPie from "./chartsDatas/TopProperties";
import MonthlyBookingLine from "./chartsDatas/chartComponent";
import { BarChart } from "@mui/x-charts";
import LoadingPreview from "../loadingPage";

const chartSetting = {
  xAxis: [{ label: "₹ Revenue in K" }],
  height: 400,
  margin: { left: 70 },
};

const Dashboard = () => {
  const dataset = useRevenueDataset();

  if (!dataset) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <LoadingPreview />
      </div>
    );
  }

  const valueFormatter = (value) => `₹ ${value}K`;

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-10">

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Revenue, Booking Trends & Property Performance
        </p>
      </div>

      {/* Revenue Chart Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Monthly Revenue
        </h2>

        <BarChart
          dataset={dataset}
          yAxis={[{ scaleType: "band", dataKey: "month" }]}
          series={[
            {
              dataKey: "revenue",
              label: "Revenue",
              valueFormatter,
            },
          ]}
          layout="horizontal"
          {...chartSetting}
        />
      </div>

      {/* Bottom Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <TopPropertiesPie />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <MonthlyBookingLine />
        </div>

      </div>

    </div>
  );
};

export default Dashboard;