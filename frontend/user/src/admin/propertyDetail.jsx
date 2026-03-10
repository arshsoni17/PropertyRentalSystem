import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
  ACTIVE: "bg-green-100 text-green-700 border-green-300",
  BLOCKED: "bg-red-100 text-red-600 border-red-300",
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/admin/properties/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", token },
        });
        if (!res.ok) throw new Error("Failed to fetch property");
        const data = await res.json();
        setProperty(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/admin/properties/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setProperty((prev) => ({ ...prev, status: newStatus }));
      showToast(`Status updated to ${newStatus}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? "✓ " : "✗ "}{toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header + Action Buttons */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-1">Property {property.id}</p>
            <h1 className="text-2xl font-bold text-gray-800">{property.title}</h1>
            <p className="text-gray-500 mt-1">📍 {property.city}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[property.status] || "bg-gray-100 text-gray-600"}`}>
              {property.status}
            </span>

            {/* PENDING → Approve or Reject */}
            {property.status === "PENDING" && (
              <>
                <button
                  onClick={() => updateStatus("ACTIVE")}
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {actionLoading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : "✓"} Approve
                </button>
                <button
                  onClick={() => updateStatus("BLOCKED")}
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold rounded-lg border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </>
            )}

            {/* ACTIVE → Block */}
            {property.status === "ACTIVE" && (
              <button
                onClick={() => updateStatus("BLOCKED")}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {actionLoading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : "🚫"} Block
              </button>
            )}

            {/* BLOCKED → Unblock */}
            {property.status === "BLOCKED" && (
              <button
                onClick={() => updateStatus("ACTIVE")}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {actionLoading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : "↩"} Unblock
              </button>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        {property.images && property.images.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="w-full h-72 bg-gray-100 overflow-hidden">
              <img
                src={`http://localhost:3000/${property.images[activeImage]?.image_path}`}
                alt="Property"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/800x400?text=No+Image"; }}
              />
            </div>
            {property.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {property.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? "border-blue-500" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`http://localhost:3000/${img.image_path}`}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/64x64?text=?"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
            No images uploaded for this property
          </div>
        )}

        {/* Property Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Property Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Price/Night</p>
              <p className="text-lg font-bold text-gray-800">₹{property.price_per_night}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Max Guests</p>
              <p className="text-lg font-bold text-gray-800">{property.max_guests}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Listed On</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(property.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {property.description && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-gray-700 text-sm leading-relaxed">{property.description}</p>
            </div>
          )}
          {property.rules && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">House Rules</p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{property.rules}</p>
            </div>
          )}
        </div>

        {/* Host Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Host Details</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
              {property.host.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{property.host.name}</p>
              <p className="text-sm text-gray-500">{property.host.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Joined {new Date(property.host.joined_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Host ID: {property.host.id}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                property.host.is_blocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
              }`}>
                {property.host.is_blocked ? "Blocked" : "Active"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PropertyDetail;