import { PieChart } from "@mui/x-charts";
import { useTopPropertiesPercentage } from "./pie";
import LoadingPreview from "../../loadingPage";

const TopPropertiesPie = () => {
  const data = useTopPropertiesPercentage();

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
        Top 5 Property Booking Share (%)
      </h2>

      <PieChart
        series={[
          {
            data: data,
            innerRadius: 60,
            outerRadius: 120,
            paddingAngle: 3,
            cornerRadius: 5,
          },
        ]}
        height={350}
      />
    </div>
  );
};

export default TopPropertiesPie;