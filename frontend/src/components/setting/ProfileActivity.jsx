import { useEffect, useState } from "react";
import { FileText, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import StudyGroupCard from "@/components/ComunityComponents/StudyGroupCard.jsx";
import PostImage from "@/components/ComunityComponents/PostImage.jsx";
import { postTypes } from "@/components/ComunityComponents/communityFeed.js";
import ViewFilters from "@/components/quickAccess/ViewFilters.jsx";

const date = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });
const dateTime = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });
const button = "rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec] disabled:opacity-50";

function ActivityPost({ post }) {
    const created = Date.parse(post.createdAt);
    const session = Date.parse(post.sessionAt);
    return (
        <li className="space-y-2 rounded-xl border border-[#dce7e1] bg-white p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#526c62]">
                <span className="rounded-md bg-[#e7f0ec] px-2 py-1 font-semibold text-[#346557]">{postTypes[post.studyKind] || postTypes.discussion}</span>
                {post.subject && <span className="[overflow-wrap:anywhere]">{post.subject}</span>}
                {Number.isFinite(created) && <time dateTime={post.createdAt}>{date.format(created)}</time>}
            </div>
            {post.text && <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">{post.text}</p>}
            {post.studyKind === "session" && Number.isFinite(session) && <p className="text-sm text-[#346557]">
                <time dateTime={post.sessionAt}>{dateTime.format(session)}</time> Manila time
            </p>}
            {post.image && <PostImage src={post.image} />}
            <Link to={post.studyGroup ? `/community/groups/${post.studyGroup._id}` : "/community"}
                className="inline-block text-xs font-semibold text-[#346557] hover:underline [overflow-wrap:anywhere]">
                {post.studyGroup?.name || "Community Feed"}
            </Link>
        </li>
    );
}

export default function ProfileActivity() {
    const [view, setView] = useState("posts");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState(null);
    const [retry, setRetry] = useState(0);
    const groups = view === "groups";
    const Icon = groups ? UsersRound : FileText;

    useEffect(() => {
        const controller = new AbortController();
        axios.get("/api/user/activity", { params: { view, page }, signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setResult(data); })
            .catch((error) => {
                if (!controller.signal.aborted) setResult({ error: error.response?.data?.message || "Could not load your activity." });
            });
        return () => controller.abort();
    }, [view, page, retry]);

    const goToPage = (next) => { setResult(null); setPage(next); };

    return (
        <section aria-labelledby="profile-activity-title" className="space-y-4">
            <h2 id="profile-activity-title" className="text-lg font-semibold">Activity</h2>
            <ViewFilters label="Profile activity" options={[["posts", "My posts"], ["groups", "Groups I created"]]} value={view}
                onChange={(next) => { if (next !== view) { setView(next); goToPage(1); } }} />
            {!result && <p role="status" className="text-sm text-[#526c62]">Loading your activity…</p>}
            {result?.error && <p role="alert" className="text-sm text-red-700">{result.error} <button type="button" className="underline"
                onClick={() => { setResult(null); setRetry((value) => value + 1); }}>Retry</button></p>}
            {result?.items?.length === 0 && <div className="rounded-xl border border-[#dce7e1] bg-white p-7 text-center">
                <Icon size={24} className="mx-auto mb-2 text-[#346557]" aria-hidden="true" />
                <p className="text-sm text-[#526c62]">{groups ? "You haven’t created any groups yet." : "You haven’t published any posts yet."}</p>
                <Link to={groups ? "/community/groups" : "/community"} className="mt-2 inline-block text-sm font-semibold text-[#346557] hover:underline">
                    {groups ? "Browse Study Groups" : "Open Community"}
                </Link>
            </div>}
            {!!result?.items?.length && <ul className={groups ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
                {result.items.map((item) => groups ? <StudyGroupCard key={item._id} group={item} /> : <ActivityPost key={item._id} post={item} />)}
            </ul>}
            {(page > 1 || result?.hasMore) && <nav aria-label="Activity pages" className="flex items-center justify-end gap-3 text-sm">
                <button type="button" className={button} onClick={() => goToPage(page - 1)} disabled={page === 1}>Previous</button>
                <span className="text-xs text-[#526c62]">Page {page}</span>
                <button type="button" className={button} onClick={() => goToPage(page + 1)} disabled={!result?.hasMore}>Next</button>
            </nav>}
        </section>
    );
}
