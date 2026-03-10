
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import logo from "/booking-svgrepo-com (3).svg";
import HeaderHost from "../headerHost";
import { DayPicker } from "react-day-picker";
import { jwtDecode } from "jwt-decode";
import { ArrowLeft } from "lucide-react";
// 
import Footer from "../footer";
//
const STATUS = {
    CONFIRMED: { pill: "bg-green-50 text-green-700 ring-1 ring-green-200", dot: "bg-green-500", label: "Confirmed" },
    PENDING: { pill: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200", dot: "bg-yellow-400", label: "Pending" },
    CANCELLED: { pill: "bg-gray-100 text-gray-500 ring-1 ring-gray-200", dot: "bg-gray-400", label: "Cancelled" },
    EXPIRED: { pill: "bg-red-50 text-red-500 ring-1 ring-red-200", dot: "bg-red-400", label: "Expired" },
};

const FILTERS = ["ALL", "CONFIRMED", "PENDING", "CANCELLED", "EXPIRED"];

const PropertyBookingDetails = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();

    const [edit, setEdit] = useState(false);
    const [unblockDates, setunblockDates] = useState(false);
    const [blockDates, setblockDates] = useState(false);

    const [blockDatesArray, setBlockedDatesArray] = useState([]);
    const [unblockDatesArray, setUnblockDatesArray] = useState([]);

    //for editing other details
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [formData, setFormData] = useState({ title: "", description: "", city: "", price_per_night: "", max_guests: "", rules: "" });
    const [saving, setSaving] = useState(false);
    //

    const [property, setProperty] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [propertyStatus, setpropertyStatus] = useState("ACTIVE");
    //
    const [disabledDates, setDisabledDates] = useState([]);
    //
    /////
    const [userRole, setUserRole] = useState("");
    if (userRole === "USER") { navigate("/home") };
    if (userRole === "ADMIN") { navigate("/admin") };
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    /////
    useEffect(() => {
        fetchData();
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = jwtDecode(token);
                setUserRole(payload.userRole);
                setUserId(payload.userId);
                setUserName(payload.userName);
            }
            catch (error) {
                console.log(error);
            }
        }
    }, [propertyId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `http://localhost:3000/auth/host/properties/${propertyId}/bookings`,
                { headers: { token } }
            );
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProperty(data.property);
            setProperty(data.property);
            setFormData({
                title: data.property.title || "",
                description: data.property.description || "",
                city: data.property.city || "",
                price_per_night: data.property.price_per_night || "",
                max_guests: data.property.max_guests || "",
                rules: data.property.rules || "",
            });
            setExistingPhotos(data.property.images || []); // adjust key based on your API response
            setBookings(data.bookings || []);
        } catch {
            setError("Failed to load booking details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchBlockedDates = async () => {
        try {
            const response = await fetch(`http://localhost:3000/propertyDetail/${propertyId}`
            );
            const data = await response.json();
            console.log(data.blockedDates)
            if (response.ok) {
                //blocked dates
                const dateListOnly = data.blockedDates.map(item => item.date);
                console.log("datessssssssssssss blockeddddddddd");
                console.log(dateListOnly);
                //disabledDates is not reactive, this is just a norma variable- react won't re-render when it changes
                //so we need to make useState for it also
                const disabled = dateListOnly.map(date => {
                    const [y, m, d] = date.split("-").map(Number);
                    return new Date(y, m - 1, d);
                });
                setDisabledDates(disabled);

                // 
                setResetKey(prev => prev + 1);
                // 
            }
            else {
                throw new Error("failed to load property detail ")
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    /////////////////////////////////////////////////////////////////// whole updating
    /// and one more condition on delte some dates or update some dates 
    const updateBlockedDates = async () => {
        try {

        }
        catch (error) {
            console.log(error);
        }
    }
    const handleSaveBlockDates = async () => {
        try {
            const token = localStorage.getItem("token");
            const formattedDates = blockDatesArray.map(date => {
                const d = new Date(date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            });
            const res = await fetch("http://localhost:3000/auth/block-dates", {
                method: "POST",
                headers: { "Content-Type": "application/json", token },
                body: JSON.stringify({ propertyId, dates: formattedDates, reason: "host_blocked" })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchBlockedDates(); // refresh calendar
                setBlockedDatesArray([]);
                setblockDates(false);
                setunblockDates(false);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSaveUnblockDates = async () => {
        try {
            const token = localStorage.getItem("token");
            const formattedDates = unblockDatesArray.map(date => {
                const d = new Date(date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            });
            const res = await fetch("http://localhost:3000/auth/unblock-dates", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", token },
                body: JSON.stringify({ propertyId, dates: formattedDates })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchBlockedDates(); // refresh calendar
                setUnblockDatesArray([]);
                setblockDates(false);
                setunblockDates(false);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };
    //////////////////////////////////////////////////////
    //Here we will handle the other details that is images and other not dates blocking unblocking
    // that we had already handled
    const handleDeletePhoto = async (photoId) => {
        if (!confirm("Delete this photo?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/auth/host/user-host-properties/${propertyId}/photos/${photoId}`, {
                method: "DELETE",
                headers: { token }
            });
            const data = await res.json();
            if (res.ok) {
                setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleUploadPhotos = async () => {
        if (newPhotos.length === 0) return;
        try {
            const token = localStorage.getItem("token");
            const fd = new FormData();
            newPhotos.forEach(file => fd.append("photos", file));
            const res = await fetch(`http://localhost:3000/auth/host/user-host-properties/${propertyId}/photos`, {
                method: "POST",
                headers: { token },
                body: fd
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setNewPhotos([]);
                fetchData(); // refresh photos
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSavePropertyDetails = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/auth/host/user-host-properties/${propertyId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", token },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchData();
                setEdit(false);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
        }
    };
    // //////
    const filtered =
        filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

    const confirmedRevenue = bookings
        .filter((b) => b.status === "CONFIRMED")
        .reduce((s, b) => s + Number(b.total_price || 0), 0);

    const fmt = (d) =>
        new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
        });

    const nights = (s, e) =>
        Math.ceil((new Date(e) - new Date(s)) / 86400000);

    const countOf = (st) => bookings.filter((b) => b.status === st).length;

    const handleEdit = () => {
        setEdit(true);
    }
    const handleCancel = () => {
        setEdit(false);
        cancelDateUpdate();
    }
    const handleunblockDates = () => {
        setunblockDates(true);
        setblockDates(false);
    }
    const handleblockDates = () => {
        setblockDates(true);
        setunblockDates(false);
    }
    const cancelDateUpdate = () => {
        setunblockDates(false);
        setblockDates(false);
        setBlockedDatesArray([]);
        setUnblockDatesArray([]);
    }
    const handleDeleteProperty = async (propertyId) => {
        const confirmed = window.confirm("Are you sure you want to delete this property? This action cannot be undone.");
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/auth/user-host-properties/${propertyId}`, {
                method: 'DELETE',
                headers: { token }
            });
            const data = await res.json();
            if (res.ok) {
                alert("Property deleted successfully.");
                navigate("/host-dashboard");
            } else {
                // backend now sends specific reason — show it directly
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        }
    };
    ///////////////////////////////////////////////fetch refunds status
    const [pendingRefunds, setPendingRefunds] = useState([]);
    const [refundsLoading, setRefundsLoading] = useState(false);
    const [showRefunds, setShowRefunds] = useState(false);

    const fetchPendingRefunds = async () => {
        try {
            setRefundsLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(
                `http://localhost:3000/auth/host/properties/${propertyId}/pending-refunds`,
                { headers: { token } }
            );
            const data = await res.json();
            if (res.ok) {
                setPendingRefunds(data.refunds);
                setShowRefunds(true);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setRefundsLoading(false);
        }
    };
    /////////////////////////////////////////////////////
    useEffect(() => {
        fetchBlockedDates();
        const interval = setInterval(() => {
            fetchBlockedDates();
        }, 1 * 60 * 1000);

        return () => clearInterval(interval);

    }, [propertyId]);
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Nav ── */}
            <HeaderHost />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-10 h-10 border-2 border-gray-200 border-t-[#FF385C] rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Loading bookings…</p>
                    </div>
                )}

                {/* ── Error ── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-6 py-4 text-sm font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* ── Property Summary Card ── */}
                        {property && (
                            <div className="bg-white rounded-lg border border-gray-100 shadow-sm mb-8 overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Left: thumbnail strip */}
                                    <div className="sm:w-56 bg-linear-to-br from-rose-50 to-red-100 flex flex-col items-center justify-center py-10 px-6 shrink-0">
                                        <span className="text-5xl mb-2 select-none">🏡</span>
                                        <span className="text-xs text-rose-300 font-mono tracking-widest">#{property.id}</span>
                                    </div>

                                    {/* Right: info */}
                                    <div className="flex-1 p-6 flex flex-col sm:flex-row gap-6">
                                        <div className="flex-1">
                                            <p className="text-xs text-[#FF385C] font-semibold uppercase tracking-widest mb-1">
                                                Property details
                                            </p>
                                            <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
                                                {property.title}
                                            </h1>
                                            <p className="text-sm text-gray-400 mb-4">
                                                📍 {property.city} &nbsp;·&nbsp;
                                                ₹{Number(property.price_per_night).toLocaleString("en-IN")}/night &nbsp;·&nbsp;
                                                {property.max_guests} guests max
                                            </p>
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${property.status === "ACTIVE"
                                                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                                    : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${property.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"}`} />
                                                {property.status}
                                            </span>
                                        </div>

                                        {/* Mini stats */}
                                        <div className="flex sm:flex-col gap-4 sm:gap-3 sm:text-right shrink-0 flex-wrap">
                                            {[
                                                { label: "Total bookings", value: bookings.length, color: "text-gray-900" },
                                                { label: "Confirmed bookings", value: countOf("CONFIRMED"), color: "text-green-600" },
                                                { label: "Confirmed revenue", value: `₹${confirmedRevenue.toLocaleString("en-IN")}`, color: "text-[#FF385C]" },
                                            ].map((st) => (
                                                <div key={st.label}>
                                                    <p className={`text-xl font-bold ${st.color}`}>{st.value}</p>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">{st.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!edit && (<>
                            <div className="flex gap-2 mb-6 flex-wrap">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-all ${filter === f
                                            ? "bg-[#FF385C] text-white border-[#FF385C] shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                            }`}
                                    >
                                        {f}
                                        <span
                                            className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${filter === f ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                                }`}
                                        >
                                            {f === "ALL" ? bookings.length : countOf(f)}
                                        </span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => navigate("/host-dashboard")}
                                    className="px-6  bg-gray-200  rounded-lg hover:bg-gray-300 font-semibold transition"
                                >
                                    ← All listings
                                </button>
                                <button className="px-6  bg-gray-200  rounded-lg hover:bg-gray-300 font-semibold transition" onClick={handleEdit}>
                                    Edit/Update Property
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProperty(property.id);
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={fetchPendingRefunds}
                                    disabled={refundsLoading}
                                    className="px-4 py-1 rounded-lg bg-yellow-100 text-yellow-700 font-semibold hover:bg-yellow-200 transition disabled:opacity-50 text-sm"
                                >
                                    Pending Refunds
                                </button>
                            </div>

                            {filtered.length === 0 && (
                                <div className="text-center py-24">
                                    {/* <p className="text-4xl mb-3">📋</p> */}
                                    <p className="text-gray-400 text-sm">
                                        No {filter !== "ALL" ? filter.toLowerCase() : ""} bookings found.
                                    </p>
                                </div>
                            )}

                            {/* ── Table ── */}
                            {filtered.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-y-auto max-h-100">

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-200">
                                            <thead>
                                                <tr className="border-b border-gray-100 bg-gray-50">
                                                    {[
                                                        "Booking", "Guest", "Check-in", "Check-out",
                                                        "Nights", "Guests", "Total", "Booked on", "Status",
                                                    ].map((h) => (
                                                        <th
                                                            key={h}
                                                            className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4"
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filtered.map((b, i) => {
                                                    const sc = STATUS[b.status] || STATUS.CANCELLED;
                                                    return (
                                                        <tr
                                                            key={b.id}
                                                            className="hover:bg-gray-50 transition-colors"
                                                            style={{ animation: `fadeIn 0.35s ease ${i * 35}ms both` }}
                                                        >
                                                            {/* Booking ID */}
                                                            <td className="px-5 py-4">
                                                                <span className="text-xs font-mono text-gray-400">{b.id}</span>
                                                            </td>

                                                            {/* Guest */}
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
                                                                        {(b.guest_name || b.user_email || "G").charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">
                                                                            {b.guest_name || "Guest"}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">
                                                                            {b.user_email || `User #${b.user_id}`}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Check-in */}
                                                            <td className="px-5 py-4">
                                                                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                                                                    {fmt(b.start_date)}
                                                                </span>
                                                            </td>

                                                            {/* Check-out */}
                                                            <td className="px-5 py-4">
                                                                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                                                                    {fmt(b.end_date)}
                                                                </span>
                                                            </td>

                                                            {/* Nights */}
                                                            <td className="px-5 py-4">
                                                                <span className="bg-rose-50 text-[#FF385C] text-xs font-semibold px-2.5 py-1 rounded-full">
                                                                    {nights(b.start_date, b.end_date)}n
                                                                </span>
                                                            </td>

                                                            {/* Guests */}
                                                            <td className="px-5 py-4">
                                                                <span className="text-sm text-gray-600">👤 {b.guests}</span>
                                                            </td>

                                                            {/* Total */}
                                                            <td className="px-5 py-4">
                                                                <span className="text-sm font-bold text-gray-900">
                                                                    ₹{Number(b.total_price).toLocaleString("en-IN")}
                                                                </span>
                                                            </td>

                                                            {/* Booked on */}
                                                            <td className="px-5 py-4">
                                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                                    {fmt(b.created_at)}
                                                                </span>
                                                            </td>

                                                            {/* Status */}
                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.pill}`}
                                                                >
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                                    {sc.label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Table footer */}
                                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            Showing {filtered.length} of {bookings.length} bookings
                                        </p>
                                        {filter !== "ALL" && (
                                            <button
                                                onClick={() => setFilter("ALL")}
                                                className="text-xs text-[#FF385C] font-semibold hover:underline underline-offset-2"
                                            >
                                                Clear filter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="border border-gray-200 p-10 m-10 rounded-lg w-200 bg-white ">
                                <button className="text-xl text-white font-semibold bg-red-500  p-2 m-2 rounded-lg">Availability</button>
                                <DayPicker
                                    mode="multiple"
                                    numberOfMonths={2}
                                    disabled={[
                                        { before: new Date() },
                                        ...disabledDates
                                    ]}
                                    onSelect={(dates) => setblockDates(dates || [])}
                                    modifiersClassNames={{
                                        selected: ' h-1 w-1 bg-blue-500 rounded-4xl  text-white font-bold',
                                        disabled: 'text-red-500 line-through opacity-90',
                                    }}
                                    className="border-none"
                                />
                            </div>
                            {showRefunds && (
                                <div className="border border-gray-400 rounded-lg bg-white p-6 mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Pending Refunds
                                            <span className="ml-2 text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                {pendingRefunds.length}
                                            </span>
                                        </h2>
                                        <button
                                            onClick={() => setShowRefunds(false)}
                                            className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                                        >
                                            Close ✕
                                        </button>
                                    </div>

                                    {pendingRefunds.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-8">No pending refunds.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                                        {["Refund ID", "Booking ID", "Guest", "Amount", "Reason", "Requested On"].map(h => (
                                                            <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {pendingRefunds.map((r) => (
                                                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 text-xs font-mono text-gray-400">{r.id}</td>
                                                            <td className="px-4 py-3 text-xs font-mono text-gray-400">{r.booking_id}</td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-semibold text-gray-800 text-sm">{r.guest_name}</p>
                                                                <p className="text-xs text-gray-400">{r.guest_email}</p>
                                                            </td>
                                                            <td className="px-4 py-3 font-bold text-gray-900">
                                                                ₹{Number(r.amount).toLocaleString("en-IN")}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500 text-xs">{r.reason}</td>
                                                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                                                                {fmt(r.created_at)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>)}
                        {edit && (

                            <> CHANGES WILL NOT BE EFFECTED IS PROPERTY IS BLOCKED
                                <div><button className="px-6 py-1  bg-gray-200  rounded-lg hover:bg-gray-300 font-semibold transition" onClick={handleCancel}>
                                    <span>← Go Back</span>
                                </button></div>

                                {/* handle rest property edits */}
                                <div className="border border-gray-200 p-10 m-10 rounded-lg  bg-white ">

                                </div>

                                <div className="border border-gray-200 p-10 m-10 rounded-lg w-200 bg-white ">

                                    <button className="text-xl  font-semibold bg-gray-300  p-2 m-2 rounded-lg">Availability</button>
                                    {(!unblockDates && !blockDates) && (
                                        <>
                                            <DayPicker
                                                numberOfMonths={2}
                                                disabled={[
                                                    { before: new Date() },
                                                    ...disabledDates
                                                ]}
                                                modifiersClassNames={{
                                                    selected: ' h-1 w-1 bg-blue-500 rounded-4xl  text-white font-bold',
                                                    disabled: 'text-red-500 line-through opacity-90',
                                                }}
                                                className="border-none"
                                            />
                                            <button onClick={handleblockDates} className=" text-white font-semibold bg-red-200 hover:bg-red-500 p-2 m-2 rounded-lg">BlockDates</button>
                                            <button onClick={handleunblockDates} className=" text-white font-semibold bg-blue-200 hover:bg-blue-500 p-2 m-2 rounded-lg">UnblockDates</button>
                                            <button onClick={cancelDateUpdate} className="  font-semibold bg-gray-300 hover:bg-gray-400  p-2 m-2 rounded-lg">Cancel Date update</button></>
                                    )}
                                    {(!unblockDates && blockDates) && (
                                        <>
                                            <DayPicker
                                                mode="multiple"
                                                numberOfMonths={2}
                                                selected={blockDatesArray}
                                                disabled={[
                                                    { before: new Date() },
                                                    ...disabledDates
                                                ]}
                                                onSelect={(dates) => setBlockedDatesArray(dates || [])}
                                                modifiersClassNames={{
                                                    selected: 'bg-red-500 rounded-full text-white font-bold',
                                                    disabled: 'text-gray-300 line-through opacity-50',
                                                }}
                                                className="border-none"
                                            />

                                            <div className="grid grid-cols-[120px_130px_150px]  gap-1">
                                                <button onClick={handleblockDates} className=" text-white font-semibold bg-red-500  p-2 m-2 rounded-lg">BlockDates</button>
                                                <button onClick={handleunblockDates} className=" text-white font-semibold bg-blue-200  p-2 m-2 rounded-lg">UnblockDates</button>
                                                <button onClick={cancelDateUpdate} className="  font-semibold bg-gray-300 hover:bg-gray-400  p-2 m-2 rounded-lg">Cancel Date update</button>
                                                <br></br>
                                                <div className="col-span-3 p-2">
                                                    {blockDatesArray.length > 0 && (
                                                        <button
                                                            onClick={handleSaveBlockDates}
                                                            className="mt-2 px-4 py-1 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
                                                        >
                                                            Block {blockDatesArray.length} dates
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {(unblockDates && !blockDates) && (
                                        <>
                                            <DayPicker
                                                mode="multiple"
                                                numberOfMonths={2}
                                                selected={unblockDatesArray}
                                                disabled={(date) => {
                                                    if (date < new Date()) return true;
                                                    // only allow selecting currently blocked dates
                                                    return !disabledDates.some(d =>
                                                        d.getFullYear() === date.getFullYear() &&
                                                        d.getMonth() === date.getMonth() &&
                                                        d.getDate() === date.getDate()
                                                    );
                                                }}
                                                onSelect={(dates) => setUnblockDatesArray(dates || [])}
                                                modifiersClassNames={{
                                                    selected: 'bg-blue-900 rounded-full text-white font-bold',
                                                    disabled: 'text-gray-300 line-through opacity-50',
                                                }}
                                                className="border-none"
                                            />
                                            <div className="grid grid-cols-[120px_130px_150px] gap-1">
                                                <button onClick={handleblockDates} className=" text-white font-semibold bg-red-200  p-2 m-2 rounded-lg">BlockDates</button>
                                                <button onClick={handleunblockDates} className=" text-white font-semibold bg-blue-500  p-2 m-2 rounded-lg">UnblockDates</button>
                                                <button onClick={cancelDateUpdate} className="  font-semibold bg-gray-300 hover:bg-gray-400  p-2 m-2 rounded-lg">Cancel Date update</button>
                                                <div className="col-span-3 p-2">{unblockDatesArray.length > 0 && (
                                                    <button
                                                        onClick={handleSaveUnblockDates}
                                                        className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                                                    >
                                                        Unblock {unblockDatesArray.length} dates
                                                    </button>
                                                )}</div>

                                            </div>

                                        </>
                                    )}

                                </div>
                            </>
                        )}

                    </>
                )}
            </main>


            <Footer />
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default PropertyBookingDetails;