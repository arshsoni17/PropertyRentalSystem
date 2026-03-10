import { useEffect, useState } from "react";
import LoadingPreview from "../loadingPage";

const PropertiesHandle = () => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/admin/properties", {
        method: "GET",
        headers: { "Content-Type": "application/json", token },
      });
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      setProperties(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties =
    filter === "ALL"
      ? properties
      : properties.filter((p) => p.status === filter);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingPreview />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">

      {/* Filter Tabs + Refresh */}
      <div className="flex gap-2 mb-4 justify-between items-center flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "ACTIVE", "BLOCKED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === tab
                  ? tab === "PENDING"
                    ? "bg-yellow-500 text-white border-yellow-500"
                    : tab === "ACTIVE"
                    ? "bg-green-500 text-white border-green-500"
                    : tab === "BLOCKED"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs opacity-75">
                {tab === "ALL"
                  ? properties.length
                  : properties.filter((p) => p.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchProperties(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-gray-200">
        {filteredProperties.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No properties found</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Property ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">City</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((prop, idx) => (
                <tr key={prop.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => window.open(`/admin/property/${prop.id}`, "_blank")}
                      title="GO TO DETAILS"
                      className="font-mono text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      {prop.id}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{prop.title}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{prop.city}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      prop.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : prop.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(prop.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2 text-right">
        Showing {filteredProperties.length} of {properties.length} properties
      </p>
    </div>
  );
};

export default PropertiesHandle;