import { useEffect, useState } from "react";
import { adminApi } from "@/lib/superAdminApi.js";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(null);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        adminApi.get("/users", { params: { search }, signal: controller.signal })
            .then(({ data }) => setUsers(data.users))
            .catch(() => {
                if (!controller.signal.aborted) setError("Could not load accounts.");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [search, refresh]);

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete the account for ${user.userName}?`)) return;
        setDeleting(user._id);
        setError("");
        try {
            await adminApi.delete(`/users/${encodeURIComponent(user._id)}`);
            setUsers((current) => current.filter(({ _id }) => _id !== user._id));
            setRefresh((current) => current + 1);
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete the account.");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="p-6">
            <h1 className="mb-4 text-3xl font-bold">User Management</h1>
            <input
                type="text"
                aria-label="Search accounts"
                placeholder="Search by name or email..."
                className="mb-4 w-full rounded-lg border border-[#cbd9d1] bg-white p-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
            {loading && <p role="status" className="mb-3 text-sm">Loading accounts…</p>}
            {!loading && !error && users.length === 0 && <p className="text-sm">No matching accounts.</p>}
            <div className="overflow-x-auto rounded-xl border border-[#dbe6e0] bg-white">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2">Username</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Verified</th>
                        <th className="p-2">Tasks</th>
                        <th className="p-2">Notes</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} className="border-t">
                            <td className="p-2">{user.userName}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.isVerified ? "✅" : "❌"}</td>
                            <td className="p-2">{user.taskCount}</td>
                            <td className="p-2">{user.noteCount}</td>
                            <td className="p-2">{user.role}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => handleDelete(user)}
                                    disabled={loading || deleting !== null}
                                    className="rounded bg-red-700 px-2 py-1 text-white hover:bg-red-800 disabled:opacity-50"
                                >
                                    {deleting === user._id ? "Deleting…" : "Delete"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default UserManagement;
