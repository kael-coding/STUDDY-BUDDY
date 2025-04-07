import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/superAdmin"  // Corrected endpoint
    : "/api/superAdmin";

const SuperAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/users?search=${search}`, { withCredentials: true });
            // Filter out super admin users
            const filteredUsers = res.data.users.filter(user => user.role !== "superadmin");
            setUsers(filteredUsers);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/admin/users/${id}`, { withCredentials: true });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4"> Super Admin Dashboard</h1>
            <input
                type="text"
                placeholder="Search by name or email..."
                className="border p-2 mb-4 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <table className="w-full border text-sm text-left">
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
                                    onClick={() => handleDelete(user._id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SuperAdminDashboard;
