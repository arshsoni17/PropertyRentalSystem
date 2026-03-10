// HostPropertiesDashboard.jsx
// Route: /host-dashboard/properties
import { Camera } from "lucide-react";
import { Home } from "lucide-react";

import ProfileMenuHost from "./hostToggle";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import HeaderHost from "../headerHost";
import Footer from "../footer";

const statusStyles = {
    ACTIVE: "bg-green-50 text-green-700 ring-1 ring-green-200",
    INACTIVE: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
    PENDING: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
};

const PastPropertiese = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hostName, setHostName] = useState("");
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState("");
    if(userRole === "USER"){ navigate("/home")};
    if(userRole === "ADMIN"){navigate("/admin")};
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");

    //email data from the DB
    const [email, setUserEmail] = useState();
    const [verification, setUserVerification] = useState("NOT VERIFIED");

    const token = localStorage.getItem('token');

    const userEmail = async () => {
        const response = await fetch('http://localhost:3000/home/userProfile', {
            method: "GET",
            headers: { "Content-Type": "application/json", "token": token },
        });
        const data = await response.json();
        setUserEmail(data.email);
        if (data.is_verified == 1) {
            setUserVerification("VERIFIED")
        }
        console.log(email);
    };

    const fetchHostProperties = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/auth/host/properties", {
                headers: { token },
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProperties(data.properties || []);
        } catch {
            setError("Failed to load your properties. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const goHome = () => {
        navigate("/host-dashboard");
    }
    const switchToUser = () => {
        navigate("/home");
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = jwtDecode(token);
                setHostName(payload.userName || "Host");

                setUserRole(payload.userRole);
                setUserId(payload.userId);
                setUserName(payload.userName);

                userEmail();
            } catch { }
        }
        fetchHostProperties();
    }, []);

    const totalBookings = properties.reduce((s, p) => s + Number(p.total_bookings || 0), 0);
    const totalRevenue = properties.reduce((s, p) => s + Number(p.total_revenue || 0), 0);
    const activeCount = properties.filter((p) => p.status === "ACTIVE").length;

    return (
        <div className="min-h-screen bg-white">

            <HeaderHost />

            {/* ── Page Hero ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Your listings</h2>
                </div>
            </div>

            {/* ── Stats Strip ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                        {[
                            { label: "Total listings", value: properties.length },
                            { label: "Active now", value: activeCount },
                            { label: "Total bookings", value: totalBookings },
                            { label: "Confirmed revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
                        ].map((st) => (
                            <div key={st.label} className="py-5 px-4 sm:px-6">
                                <p className="text-2xl font-bold text-gray-900">{st.value}</p>
                                <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide font-medium">{st.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-10 h-10 border-2 border-gray-200 border-t-[#FF385C] rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Loading your listings…</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                {!loading && !error && properties.length === 0 && (
                    <div className="text-center py-32">
                        <div className="text-6xl mb-4">🏠</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">No listings yet</h2>
                        <p className="text-gray-400 text-sm">Add your first property to start hosting.</p>
                    </div>
                )}

                {!loading && properties.length > 0 && (
                    <>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {properties.map((property, i) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    index={i}
                                    onClick={() =>
                                        navigate(`/host-dashboard/properties/${property.id}/bookings`)
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>
            <Footer/>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};



/*PropertyCard*/
const PropertyCard = ({ property, index, onClick }) => {
    const sc = statusStyles[property.status] || statusStyles.INACTIVE;
    const fmt = (d) =>
        new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
        });

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 border border-gray-100"
            style={{ animation: `fadeUp 0.4s ease ${index * 60}ms both` }}
        >
            {/* Thumbnail */}
            <div className="relative h-52 bg-linear-to-br from-rose-50 via-red-50 to-orange-50 flex flex-col items-center justify-center overflow-hidden">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-500 select-none">🏡</span>
                <span className="text-xs text-rose-300 mt-2 font-mono tracking-widest">#{property.id}</span>

                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${sc}`}>
                    {property.status}
                </span>

                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {property.total_bookings ?? 0} bookings
                </span>
            </div>

            {/* Body */}
            <div className="p-4">
                {/* Title + price */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
                        {property.title}
                    </h2>
                    <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                            ₹{Number(property.price_per_night).toLocaleString("en-IN")}
                        </span>
                        <span className="text-gray-400 text-xs"> /night</span>
                    </div>
                </div>

                <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                    <span>📍</span>
                    <span>{property.city}</span>
                    <span className="text-gray-300">·</span>
                    <span>{property.max_guests} guests max</span>
                </p>

                {/* Revenue chip */}
                <div className="flex items-center justify-between bg-rose-50 rounded-xl px-3 py-2 mb-4 border border-rose-100">
                    <span className="text-xs text-rose-500 font-medium">Confirmed revenue</span>
                    <span className="text-sm font-bold text-[#FF385C]">
                        ₹{Number(property.total_revenue ?? 0).toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Listed {fmt(property.created_at)}</span>
                    <span className="text-xs font-semibold text-[#FF385C] group-hover:underline underline-offset-2">
                        View bookings →
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PastPropertiese;