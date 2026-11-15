import { useEffect, useState } from "react";
import { ArrowLeft, UsersRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Community from "@/pages/mainPages/Community.jsx";
import { useAuthStore } from "@/store/authStore.js";

function StudyGroupDetails({ groupId }) {
    const student = useAuthStore((state) => state.user?.role === "user");
    const [group, setGroup] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [retry, setRetry] = useState(0);
    const endpoint = `/api/community/groups/${encodeURIComponent(groupId)}`;

    useEffect(() => {
        const controller = new AbortController();
        axios.get(endpoint, { signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setGroup(data.group); })
            .catch((requestError) => {
                if (!controller.signal.aborted) setError(requestError.response?.data?.message || "Could not open the study group.");
            });
        return () => controller.abort();
    }, [endpoint, retry]);

    const changeMembership = async () => {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            const { data } = await axios.put(`${endpoint}/membership`, { joined: !group.isMember });
            setGroup(data.group);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not update your membership.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-5">
            <Link to="/community/groups" className="inline-flex items-center gap-2 text-sm font-semibold text-[#346557] hover:underline">
                <ArrowLeft size={16} aria-hidden="true" /> Study Groups
            </Link>
            {error && <p role="alert" className="text-sm text-red-700">{error}
                {!group && <button type="button" onClick={() => { setError(""); setRetry((value) => value + 1); }} className="ml-1 underline">Retry</button>}
            </p>}
            {!group && !error && <p role="status" className="text-sm text-[#526c62]">Loading study group…</p>}
            {group && <>
                <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[#dce7e1] bg-white p-5 sm:p-6">
                    <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                        <span className="inline-block rounded-md bg-[#e7f0ec] px-2 py-1 text-xs font-semibold text-[#346557]">{group.subject}</span>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight">{group.name}</h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-[#526c62]">{group.description}</p>
                        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-[#526c62]">
                            <UsersRound size={16} aria-hidden="true" /> {group.memberCount} {group.memberCount === 1 ? "member" : "members"}{group.isOwner ? " · Group creator" : group.isMember ? " · Joined" : ""}
                        </p>
                    </div>
                    {student && !group.isOwner && <button type="button" onClick={changeMembership} disabled={busy}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${group.isMember ? "border border-[#cbd9d1] text-[#346557] hover:bg-[#e7f0ec]" : "bg-[#346557] text-white hover:bg-[#294f43]"}`}>
                        {busy ? "Saving…" : group.isMember ? "Leave Group" : "Join Group"}
                    </button>}
                </header>
                {student && !group.isMember && <p className="rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm text-[#346557]">Join this group to publish questions, resources, and review sessions.</p>}
                <Community group={group} />
            </>}
        </div>
    );
}

export default function StudyGroupPage() {
    const { groupId } = useParams();
    return <StudyGroupDetails key={groupId} groupId={groupId} />;
}
