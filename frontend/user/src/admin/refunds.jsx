import { useEffect, useState } from "react";

const FILTERS = ["ALL", "PENDING", "PROCESSED"];

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
});

const Refunds = () => {
    const [refunds, setRefunds] = useState([]);
    const [counts, setCounts] = useState({});
    const [amounts, setAmounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/admin/refunds", {
                method: "GET",
                headers: { token },
            });
            if (!res.ok) throw new Error("Failed to fetch refunds");
            const data = await res.json();
            if (data.success) {
                setRefunds(data.data);
                setCounts(data.counts);
                setAmounts(data.amounts);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === "ALL" ? refunds : refunds.filter(r => r.refund_status === filter);

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center min-h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );

    return (
        <div className="p-6">

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
                <p className="text-sm text-gray-500 mt-1">All refund requests across the platform</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                    <p className="text-xl font-bold text-gray-900">{counts.total ?? 0}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Total</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                    <p className="text-xl font-bold text-yellow-600">{counts.pending ?? 0}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Pending</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                    <p className="text-xl font-bold text-green-600">{counts.processed ?? 0}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Processed</p>
                </div>
            </div>

            {/* Amount Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                    <p className="text-xl font-bold text-yellow-600">₹{Number(amounts.pending ?? 0).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Pending Amount</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                    <p className="text-xl font-bold text-green-600">₹{Number(amounts.processed ?? 0).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Processed Amount</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}
                    >
                        {f} ({f === "ALL" ? refunds.length : refunds.filter(r => r.refund_status === f).length})
                    </button>
                ))}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-sm">No {filter !== "ALL" ? filter.toLowerCase() : ""} refunds found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                    {["Refund ID", "User", "Property", "Booking Dates", "Paid", "Refund Amt", "Reason", "Requested On", "Status"].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((r) => (
                                    <tr key={r.refund_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 text-xs font-mono text-gray-400">#{r.refund_id}</td>
                                        <td className="px-4 py-4">
                                            <p className="font-semibold text-gray-800">{r.user_name}</p>
                                            <p className="text-xs text-gray-400">{r.user_email}</p>
                                        </td>
                                        <td className="px-4 py-4 ">
                                            <button
                                                className="font-semibold text-gray-800 p-1 rounded-lg hover:bg-gray-200"
                                                onClick={() => window.open(`${window.location.origin}/admin/property/${r.property_id}`, '_blank')}
                                            >
                                                {r.property_title}
                                                <p className="text-xs text-gray-400"> {r.property_city}</p>
                                            </button>
                                            
                                        </td>
                                        <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                                            {fmt(r.start_date)} → {fmt(r.end_date)}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-gray-700">
                                            ₹{Number(r.paid_amount).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-4 font-bold text-gray-900">
                                            ₹{Number(r.amount).toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-4 py-4 text-xs text-gray-500 max-w-32 truncate">{r.reason}</td>
                                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{fmt(r.refund_requested_at)}</td>
                                        <td className={`px-4 py-4 text-xs font-semibold ${r.refund_status === "PROCESSED" ? "text-green-600" : "text-yellow-600"
                                            }`}>
                                            {r.refund_status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-400">Showing {filtered.length} of {refunds.length} refunds</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Refunds;