import { useEffect, useState } from "react";
import LoadingPreview from "../loadingPage";

const BookingsHandle = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [netRevenue, setNetRevenue] = useState(0);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/admin/bookings", {
        method: "GET",
        headers: { "Content-Type": "application/json", token },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data.data || []);
      setNetRevenue(data.net_revenue || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingPreview /></div>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow p-4">

      
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-semibold text-gray-700">
            All Bookings <span className="text-gray-400 font-normal text-xs">({bookings.length})</span>
          </h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-sm">
            <span className="text-gray-500 text-xl">Net Revenue: </span>
            <span className="font-bold text-xl ">₹{netRevenue.toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={() => fetchBookings(true)}
          disabled={refreshing}
          className="px-3 py-1.5 text-sm border rounded-lg text-gray-500 hover:text-gray-800 hover:border-gray-400 disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      
      <div className="overflow-y-auto max-h-[65vh] rounded-lg border border-gray-200">
        {bookings.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No bookings found</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {["ID", "User", "Property", "Dates", "Guests", "Total", "Booking Status", "Payment", "Booked On"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 border-b">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, idx) => (
                <tr key={b.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{b.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-gray-800">{b.user_name}</p>
                    <p className="text-xs text-gray-400">{b.user_email}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-gray-800">{b.property_title}</p>
                    <p className="text-xs text-gray-400">{b.property_city}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    <p>{new Date(b.start_date).toLocaleDateString()}</p>
                    <p className="text-gray-400">→ {new Date(b.end_date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{b.guests}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                    ₹{Number(b.total_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{b.payment_status || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BookingsHandle;