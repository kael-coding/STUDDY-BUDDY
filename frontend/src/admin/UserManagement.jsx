import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { adminApi } from "@/lib/superAdminApi.js";
import { AdminHeading } from "./components/AdminPanels.jsx";
import AdminDialog from "./components/AdminDialog.jsx";
import AccountsTable from "./components/AccountsTable.jsx";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
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
        const timer = setTimeout(() => adminApi.get("/users", { params: { search }, signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setUsers(data.users); })
            .catch(() => { if (!controller.signal.aborted) setError("Could not load accounts."); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); }), 200);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [search, revision]);

    const handleDelete = async () => {
        if (!selected || deleting) return;
        setDeleting(true);
        setDeleteError("");
        try {
            await adminApi.delete(`/users/${encodeURIComponent(selected._id)}`);
            setUsers((current) => current.filter(({ _id }) => _id !== selected._id));
            setRevision((value) => value + 1);
            setSelected(null);
        } catch (requestError) {
            setDeleteError(requestError.response?.data?.message || "Could not delete the account.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5 py-4">
            <AdminHeading title="User Management" description="Search student and community admin accounts." />
            <label className="flex max-w-sm items-center gap-2 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 focus-within:border-[#346557]">
                <Search size={17} className="shrink-0 text-[#526c62]" aria-hidden="true" />
                <input type="search" aria-label="Search accounts" placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)}
                    className="min-w-0 flex-1 text-sm outline-none" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error} <button type="button" className="underline" onClick={() => setRevision((value) => value + 1)}>Retry</button></p>}
            {loading && <p role="status" className="text-sm text-[#526c62]">Loading accounts…</p>}
            {!loading && !error && <AccountsTable users={users} onDelete={(user) => { setDeleteError(""); setSelected(user); }} />}
            {selected && <AdminDialog title="Delete account?" busy={deleting} onClose={() => setSelected(null)} actions={
                <>
                    <button type="button" disabled={deleting} onClick={() => setSelected(null)} className="rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold">Cancel</button>
                    <button type="button" disabled={deleting} onClick={handleDelete} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {deleting ? "Deleting…" : "Delete account"}
                    </button>
                </>
            }>
                <p className="text-sm [overflow-wrap:anywhere]">Permanently delete the account for <strong>{selected.userName}</strong> ({selected.email})?</p>
                {deleteError && <p role="alert" className="text-sm text-red-700">{deleteError}</p>}
            </AdminDialog>}
        </div>
    );
}
