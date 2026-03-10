import { useEffect, useState, useRef } from "react";
import LoadingPreview from "../loadingPage";

const UsersHandle = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/admin/users", {
                method: "GET",
                headers: { token },
            });
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            if (data.success) setUsers(data.data);
            else throw new Error(data.message || "Failed to load users");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const blockUser = async (id, is_blocked) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:3000/admin/users/${id}/block`, {
                method: "PATCH",
                headers: { token },
            });
            if( res.status === 403){ return alert("Can't Block Admin")};
            if (!res.ok) throw new Error("Failed to update user");
            const data = await res.json();
            if (data.success) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, is_blocked: !is_blocked } : u))
                );
            }
        } catch (err) {
            alert(err.message);
        }
    };
    const roleBadgeClass = (role) => {
        if (role === "USER") return "bg-gray-200 text-black";
        if (role === "ADMIN") return "bg-red-100 text-red-700";
        if (role === "HOST") return "bg-blue-100 text-blue-700";
        return "bg-gray-100 text-gray-700";
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-sm text-gray-500 mt-1">All registered accounts</p>
                </div>


                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">No users found.</td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-400 text-xs">{u.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleBadgeClass(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1 text-xs font-medium ${u.is_blocked ? "text-red-600" : "text-green-600"}`}>
                                                <span className={`w-2 h-2 rounded-full ${u.is_blocked ? "bg-red-500" : "bg-green-500"}`}></span>
                                                {u.is_blocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            {new Date(u.created_at).toLocaleDateString("en-IN", {
                                                day: "2-digit", month: "short", year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => blockUser(u.id, u.is_blocked)}
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${u.is_blocked
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                    }`}
                                            >
                                                {u.is_blocked ? "Unblock" : "Block"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
export default UsersHandle;