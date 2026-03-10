
import { Home } from "lucide-react";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router";

const openNewTab = (propertyId) => {
    window.open(`${window.location.origin}/property/book/${propertyId}`, '_blank');
};

const UserProfile = () => {
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");

    const [email, setUserEmail] = useState("");
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
            setUserVerification("VERIFIED");
        }
    };

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showBookings, setShowBookings] = useState(false);

    const fetchBookings = async () => {
        try {
            const response = await fetch("http://localhost:3000/home/userBookings", {
                method: "GET",
                headers: { token: localStorage.getItem("token") },
            });
            const data = await response.json();
            const rows = data.rows;
            const bookingsWithNames = await Promise.all(
                rows.map(async (booking) => {
                    try {
                        const propRes = await fetch(`http://localhost:3000/auth/${booking.property_id}`, {  
                            headers: { token: localStorage.getItem("token") },
                        });
                        const propData = await propRes.json();
                        return { ...booking, property_name: propData.pro_title };
                    } catch {
                        return { ...booking, property_name: `Property ${booking.property_id}` };
                    }
                })
            );
            setBookings(bookingsWithNames);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch bookings");
            setLoading(false);
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

    const formatDateTime = (date) =>
        new Date(date).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    const cancelBooking = async (bookingId) => {
        try {
            const confirmCancel = window.confirm("Are you sure you want to cancel?");
            if (!confirmCancel) return;
            const response = await fetch(`http://localhost:3000/auth/bookings/${bookingId}/cancel`, {
                method: "POST",
                headers: { token: localStorage.getItem("token") },
            });
            const data = await response.json();
            if (response.ok) {
                alert("Booking cancelled successfully");
                setBookings((prev) =>
                    prev.map((b) => b.id === bookingId ? { ...b, status: "CANCELLED" } : b)
                );
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error cancelling booking");
        }
    };
    // 
    const [refunds, setRefunds] = useState([]);
    const [refundsLoading, setRefundsLoading] = useState(false);
    const [showRefunds, setShowRefunds] = useState(false);

    const fetchRefunds = async () => {
        try {
            setRefundsLoading(true);
            const res = await fetch("http://localhost:3000/auth/user/refunds", {
                method: "GET",
                headers: { token: localStorage.getItem("token") },
            });
            const data = await res.json();
            if (data.success) setRefunds(data.refunds);
        } catch (err) {
            console.error(err);
        } finally {
            setRefundsLoading(false);
        }
    };
    // 
    //
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState(1); // 1=request code, 2=verify+set new
    const [passwordEmail, setPasswordEmail] = useState("");
    const [passwordCode, setPasswordCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleRequestCode = async () => {
        if (!passwordEmail.trim()) return alert("Enter your email.");
        try {
            setPasswordLoading(true);
            const res = await fetch("http://localhost:3000/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json", token: localStorage.getItem("token") },
                body: JSON.stringify({ email: passwordEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setPasswordStep(2);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleVerifyAndReset = async () => {
        if (!passwordCode.trim() || !newPassword.trim()) return alert("Fill all fields.");
        try {
            setPasswordLoading(true);
            const res = await fetch("http://localhost:3000/auth/reset-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json", token: localStorage.getItem("token") },
                body: JSON.stringify({ email: passwordEmail, code: passwordCode, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Password changed successfully. Please log in again.");
                setShowPasswordModal(false);
                setPasswordStep(1);
                setPasswordEmail("");
                setPasswordCode("");
                setNewPassword("");
                localStorage.removeItem("token");
                navigate("/auth");
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setPasswordLoading(false);
        }
    };

    //
    const navigate = useNavigate();
    const goHome = () => navigate("/");

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = jwtDecode(token);
                setUserRole(payload.userRole);
                setUserId(payload.userId);
                setUserName(payload.userName);
                userEmail();
                fetchBookings();
            } catch (error) {
                console.log(error);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">{userName || "Guest"}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={goHome}
                        className="border border-gray-300 hover:border-gray-900 hover:shadow-md p-3 rounded-full transition"
                    >
                        <Home size={20} />
                    </button>
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="max-w-7xl mx-auto bg-white rounded-xl border border-gray-200 p-8">

                {/* Profile Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-24 h-24 bg-linear-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                {userName.charAt(0).toUpperCase()}
                            </div>

                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">{userName}</h2>
                            <p className="text-sm text-gray-600 mt-1">ID: {userId}</p>
                            <span className="inline-block mt-2 px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full">
                                {userRole}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-6 py-3 border border-gray-900 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition"
                    >
                        Change Password
                    </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Username</p>
                        <p className="font-semibold text-gray-900 text-lg">{userName}</p>
                    </div>
                    <div className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Email</p>
                        <p className="font-semibold text-gray-900 text-lg">{email}</p>
                    </div>
                    <div className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Role</p>
                        <p className="font-semibold text-gray-900 text-lg">{userRole}</p>
                    </div>
                    <div className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Account Status</p>
                        <p className="font-semibold text-teal-600 text-lg">{verification}</p>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900">Past Bookings</h2>
                        <button
                            onClick={() => setShowBookings(!showBookings)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                        >
                            {showBookings ? "Hide Bookings" : "Show Bookings"}
                        </button>
                    </div>

                    {showBookings && (
                        <div className="h-100 overflow-x-auto overflow-y-scroll">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Booked-from</th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">To</th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Booked</th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Price</th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No bookings found.</td>
                                        </tr>
                                    ) : (
                                        bookings.map((b) => (
                                            <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="py-4 px-4">
                                                    <button
                                                        className="text-gray-900 font-semibold hover:underline"
                                                        onClick={() => openNewTab(b.property_id)}
                                                    >
                                                        {b.property_name}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4 text-gray-700">{formatDate(b.start_date)}</td>
                                                <td className="py-4 px-4 text-gray-700">{formatDate(b.end_date)}</td>
                                                <td className="py-4 px-4 text-gray-600 text-sm">{formatDateTime(b.created_at)}</td>
                                                <td className="py-4 px-4 font-semibold text-gray-900">₹{b.total_price.toLocaleString()}</td>
                                                <td className={`py-4 px-4 font-semibold ${b.status === "CONFIRMED" ? "text-teal-600" :
                                                    b.status === "CANCELLED" ? "text-gray-400" : "text-rose-600"}`}>
                                                    {b.status}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {b.status === "CONFIRMED" && (
                                                        <button
                                                            onClick={() => cancelBooking(b.id)}
                                                            className="text-sm font-semibold text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Refunds Section */}
                <div className="border-t border-gray-200 pt-8 mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900">My Refunds</h2>
                        <button
                            onClick={() => {
                                if (!showRefunds) fetchRefunds();
                                setShowRefunds(!showRefunds);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                        >
                            {showRefunds ? "Hide Refunds" : "Show Refunds"}
                        </button>
                    </div>

                    {showRefunds && (
                        <>
                            {refundsLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
                                </div>
                            ) : refunds.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-10">No refunds found.</p>
                            ) : (
                                <div className="h-80 overflow-x-auto overflow-y-scroll">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dates</th>
                                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid</th>
                                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Refund</th>
                                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Requested On</th>
                                                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {refunds.map((r) => (
                                                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                    <td className="py-4 px-4">
                                                        <button
                                                            className="text-gray-900 p-1 rounded-lg font-semibold hover:bg-gray-200 text-left"
                                                            onClick={() => openNewTab(r.property_id)}
                                                        >
                                                            {r.property_title}
                                                            <p className="text-xs text-gray-400">{r.property_city}</p>
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-600 text-sm whitespace-nowrap">
                                                        {formatDate(r.start_date)} → {formatDate(r.end_date)}
                                                    </td>
                                                    <td className="py-4 px-4 font-semibold text-gray-700">
                                                        ₹{Number(r.paid_amount).toLocaleString()}
                                                    </td>
                                                    <td className="py-4 px-4 font-bold text-gray-900">
                                                        ₹{Number(r.amount).toLocaleString()}
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-500 text-sm max-w-32 truncate">{r.reason}</td>
                                                    <td className="py-4 px-4 text-gray-500 text-sm whitespace-nowrap">
                                                        {formatDateTime(r.created_at)}
                                                    </td>
                                                    <td className={`py-4 px-4 font-semibold text-sm ${r.status === "COMPLETED" ? "text-teal-600" :
                                                        r.status === "PENDING" ? "text-yellow-600" :
                                                            r.status === "APPROVED" ? "text-blue-600" :
                                                                "text-rose-600"
                                                        }`}>
                                                        {r.status}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                                <button
                                    onClick={() => { setShowPasswordModal(false); setPasswordStep(1); setPasswordEmail(""); setPasswordCode(""); setNewPassword(""); }}
                                    className="text-gray-400 hover:text-gray-600 text-lg font-semibold"
                                >
                                    ✕
                                </button>
                            </div>

                            {passwordStep === 1 && (
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-gray-500">Enter your email to receive a verification code.</p>
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        value={passwordEmail}
                                        onChange={(e) => setPasswordEmail(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900"
                                    />
                                    <button
                                        onClick={handleRequestCode}
                                        disabled={passwordLoading}
                                        className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50"
                                    >
                                        {passwordLoading ? "Sending..." : "Send Code"}
                                    </button>
                                </div>
                            )}

                            {passwordStep === 2 && (
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-gray-500">Enter the code sent to <span className="font-semibold">{passwordEmail}</span> and your new password.</p>
                                    <input
                                        type="text"
                                        placeholder="Verification code"
                                        value={passwordCode}
                                        onChange={(e) => setPasswordCode(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900"
                                    />
                                    <input
                                        type="password"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-900"
                                    />
                                    <button
                                        onClick={handleVerifyAndReset}
                                        disabled={passwordLoading}
                                        className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50"
                                    >
                                        {passwordLoading ? "Verifying..." : "Change Password"}
                                    </button>
                                    <button
                                        onClick={() => setPasswordStep(1)}
                                        className="text-xs text-gray-400 hover:text-gray-600 text-center"
                                    >
                                        ← Back
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;