import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/adminApi.js";
import { AdminHeading } from "./components/AdminPanels.jsx";
import AdminDialog from "./components/AdminDialog.jsx";
import AccountsTable from "./components/AccountsTable.jsx";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("all");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        const timer = setTimeout(() => adminApi.get("/users", { params: { search, role, page }, signal: controller.signal })
            .then(({ data }) => {
                if (controller.signal.aborted) return;
                setUsers(data.users);
                setPagination({ page: data.page, pages: data.pages, total: data.total });
            })
            .catch(() => { if (!controller.signal.aborted) setError("Could not load accounts."); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); }), 200);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [search, role, page, revision]);

    const handleDelete = async () => {
        if (!selected || deleting) return;
        setDeleting(true);
        setDeleteError("");
        try {
            await adminApi.delete(`/users/${encodeURIComponent(selected._id)}`);
            setUsers((current) => current.filter(({ _id }) => _id !== selected._id));
            setRevision((value) => value + 1);
            setSelected(null);
            toast.success("Account deleted.");
        } catch (requestError) {
            setDeleteError(requestError.response?.data?.message || "Could not delete the account.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5 py-4">
            <AdminHeading title="User Management" description="Search student and admin accounts." />
            <div className="flex flex-wrap items-center gap-3">
                <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 focus-within:border-[#346557]">
                    <Search size={17} className="shrink-0 text-[#526c62]" aria-hidden="true" />
                    <input type="search" aria-label="Search accounts" placeholder="Search by name or email" value={search} maxLength={120}
                        onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="min-w-0 flex-1 text-sm outline-none" />
                </label>
                <select aria-label="Filter by account role" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}
                    className="rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm">
                    <option value="all">All roles</option>
                    <option value="user">Students</option>
                    <option value="admin">Admins</option>
                </select>
            </div>
            {error && <p role="alert" className="text-sm text-red-700">{error} <button type="button" className="underline" onClick={() => setRevision((value) => value + 1)}>Retry</button></p>}
            {loading && <p role="status" className="text-sm text-[#526c62]">Loading accounts…</p>}
            {!loading && !error && <>
                <AccountsTable users={users} onDelete={(user) => { setDeleteError(""); setSelected(user); }} />
                {pagination.total > 0 && <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#526c62]">
                    <p>{pagination.total.toLocaleString()} {pagination.total === 1 ? "account" : "accounts"}</p>
                    {pagination.pages > 1 && <nav aria-label="Account pages" className="flex items-center gap-2">
                        <button type="button" aria-label="Previous account page" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1}
                            className="rounded-lg border border-[#cbd9d1] bg-white p-2 disabled:opacity-50"><ChevronLeft size={16} aria-hidden="true" /></button>
                        <span>Page {pagination.page} of {pagination.pages}</span>
                        <button type="button" aria-label="Next account page" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                            className="rounded-lg border border-[#cbd9d1] bg-white p-2 disabled:opacity-50"><ChevronRight size={16} aria-hidden="true" /></button>
                    </nav>}
                </div>}
            </>}
            {selected && <AdminDialog title="Delete account?" busy={deleting} onClose={() => setSelected(null)} actions={
                <>
                    <button type="button" disabled={deleting} onClick={() => setSelected(null)} className="rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold">Cancel</button>
                    <button type="button" disabled={deleting} onClick={handleDelete} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {deleting ? "Deleting…" : "Delete account"}
                    </button>
                </>
            }>
                <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-700"><ShieldAlert size={20} aria-hidden="true" /></span>
                    <p className="min-w-0 text-sm [overflow-wrap:anywhere]">Permanently delete the account for <strong>{selected.userName}</strong> ({selected.email})?</p>
                </div>
                {deleteError && <p role="alert" className="text-sm text-red-700">{deleteError}</p>}
            </AdminDialog>}
        </div>
    );
}
