import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, UsersRound } from "lucide-react";
import axios from "axios";
import CreateStudyGroupDialog from "@/components/ComunityComponents/CreateStudyGroupDialog.jsx";
import StudyGroupCard from "@/components/ComunityComponents/StudyGroupCard.jsx";
import ViewFilters from "@/components/quickAccess/ViewFilters.jsx";
import { useAuthStore } from "@/store/authStore.js";

const button = "rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec] disabled:opacity-50";

export default function StudyGroups() {
    const student = useAuthStore((state) => state.user?.role === "user");
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState(null);
    const [retry, setRetry] = useState(0);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const { data } = await axios.get("/api/community/groups", {
                    params: { search: search.trim(), joined: filter === "joined", page },
                    signal: controller.signal,
                });
                if (!controller.signal.aborted) setResult(data);
            } catch (error) {
                if (!controller.signal.aborted) setResult({ error: error.response?.data?.message || "Could not load study groups." });
            }
        }, search.trim() ? 200 : 0);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [search, filter, page, retry]);

    const goToPage = (next) => { setResult(null); setPage(next); };

    return (
        <div className="space-y-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Study Groups</h2>
                    <p className="mt-1 text-sm text-[#526c62]">Connect with classmates and exchange study resources.</p>
                </div>
                {student && <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#346557] px-3 py-2 text-sm font-semibold text-white hover:bg-[#294f43]">
                    <Plus size={17} aria-hidden="true" /> Create Group
                </button>}
            </header>
            <div className="flex flex-wrap items-center gap-3">
                <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 focus-within:border-[#346557]">
                    <Search size={16} className="shrink-0 text-[#526c62]" aria-hidden="true" />
                    <input type="search" aria-label="Search groups" placeholder="Search by name or subject" maxLength={80} value={search}
                        onChange={(event) => { setSearch(event.target.value); goToPage(1); }} className="w-full min-w-0 text-sm outline-none" />
                </label>
                {student && <ViewFilters label="Group membership" options={[["all", "All groups"], ["joined", "My groups"]]} value={filter}
                    onChange={(next) => { if (next !== filter) { setFilter(next); goToPage(1); } }} />}
            </div>
            {!result && <p role="status" className="text-sm text-[#526c62]">Loading groups…</p>}
            {result?.error && <p role="alert" className="text-sm text-red-700">{result.error} <button type="button" className="underline"
                onClick={() => { setResult(null); setRetry((value) => value + 1); }}>Retry</button></p>}
            {result?.groups?.length === 0 && <div className="rounded-xl border border-[#dce7e1] bg-white p-8 text-center">
                <UsersRound size={24} className="mx-auto mb-2 text-[#346557]" aria-hidden="true" />
                <p className="text-sm text-[#526c62]">{search.trim() ? "No groups match your search." : filter === "joined" ? "You haven’t joined any groups yet." : "No study groups yet."}</p>
            </div>}
            {!!result?.groups?.length && <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.groups.map((group) => <StudyGroupCard key={group._id} group={group} />)}
            </ul>}
            {(page > 1 || result?.hasMore) && <nav aria-label="Study group pages" className="flex items-center justify-end gap-3">
                <button type="button" className={button} disabled={page === 1} onClick={() => goToPage(page - 1)}>Previous</button>
                <span className="text-xs text-[#526c62]">Page {page}</span>
                <button type="button" className={button} disabled={!result?.hasMore} onClick={() => goToPage(page + 1)}>Next</button>
            </nav>}
            {creating && <CreateStudyGroupDialog onClose={() => setCreating(false)} onCreate={(group) => navigate(`/community/groups/${group._id}`)} />}
        </div>
    );
}
