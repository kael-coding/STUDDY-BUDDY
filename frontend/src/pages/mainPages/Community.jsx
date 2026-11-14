import { useEffect, useState } from "react";
import { MessagesSquare, SlidersHorizontal, UsersRound } from "lucide-react";
import PostForm from "@/components/ComunityComponents/PostForm.jsx";
import Post from "@/components/ComunityComponents/Post.jsx";
import PostModal from "@/components/ComunityComponents/PostModal.jsx";
import SubjectSpaces from "@/components/ComunityComponents/SubjectSpaces.jsx";
import { getSubjectSpaces, postTypes, subjectKey } from "@/components/ComunityComponents/communityFeed.js";
import { useCommunityStore } from "@/store/communityStore.js";

const selectClass = "mt-1 block w-full rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm text-[#233e35]";

export default function Community() {
    const { posts, getPosts, selectedPost, setSelectedPost, isLoading, error } = useCommunityStore();
    const [subject, setSubject] = useState(null);
    const [kind, setKind] = useState("all");
    const spaces = getSubjectSpaces(posts);
    const activeSpace = spaces.find(({ key }) => key === subject);
    const activeSubject = activeSpace?.key ?? null;
    const visible = posts.filter((post) =>
        (activeSubject === null || subjectKey(post.subject) === activeSubject) &&
        (kind === "all" || kind === (post.studyKind || "discussion")),
    );

    useEffect(() => {
        setSelectedPost(null);
        getPosts();
        return () => setSelectedPost(null);
    }, [getPosts, setSelectedPost]);

    return (
        <div className="mx-auto max-w-6xl space-y-5 py-3 sm:py-5">
            <header className="flex items-center gap-4 rounded-2xl border border-[#dce7e1] bg-[#e7f0ec] p-5 sm:p-7">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-[#346557]">
                    <UsersRound size={24} aria-hidden="true" />
                </span>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#233e35] sm:text-3xl">Study Groups</h1>
                    <p className="mt-1 text-sm text-[#526c62]">Ask questions, share resources, and plan review sessions by subject.</p>
                </div>
            </header>
            <div className="grid items-start gap-5 xl:grid-cols-[15rem_minmax(0,1fr)]">
                <div className="hidden xl:block">
                    <SubjectSpaces spaces={spaces} total={posts.length} selected={activeSubject} onSelect={setSubject} />
                </div>
                <div className="min-w-0 space-y-5">
                    <PostForm initialSubject={activeSpace?.label || ""} />

                    <section aria-labelledby="feed-title" className="space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[#dce7e1] bg-white p-4">
                            <div className="min-w-0">
                                <h2 id="feed-title" className="flex items-center gap-2 font-semibold text-[#233e35] [overflow-wrap:anywhere]">
                                    <SlidersHorizontal size={16} className="shrink-0 text-[#346557]" aria-hidden="true" />
                                    {activeSpace?.label || "Community Feed"}
                                </h2>
                                <p aria-live="polite" className="mt-1 text-xs text-[#526c62]">{visible.length} {visible.length === 1 ? "post" : "posts"}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <label className="max-w-44 text-xs font-medium text-[#526c62] xl:hidden">Subject space
                                    <select value={activeSubject === null ? "" : "subject:" + activeSubject}
                                        onChange={(event) => setSubject(event.target.value.slice(8) || null)} className={selectClass}>
                                        <option value="">All subjects</option>
                                        {spaces.map(({ key, label }) => <option key={key} value={"subject:" + key}>{label}</option>)}
                                    </select>
                                </label>
                                <label className="text-xs font-medium text-[#526c62]">Post type
                                    <select value={kind} onChange={(event) => setKind(event.target.value)} className={selectClass}>
                                        <option value="all">All posts</option>
                                        {Object.entries(postTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                    </select>
                                </label>
                            </div>
                        </div>
                        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error} <button type="button" onClick={getPosts} className="underline">Reload feed</button></p>}
                        {isLoading && !posts.length && <p role="status" className="p-3 text-sm text-[#526c62]">Loading posts…</p>}
                        {!isLoading && !error && !visible.length && (
                            <div className="rounded-xl border border-[#dce7e1] bg-white p-8 text-center">
                                <MessagesSquare className="mx-auto mb-3 text-[#346557]" size={24} aria-hidden="true" />
                                <p className="font-semibold">{posts.length ? "No matching posts" : "No posts yet"}</p>
                                {posts.length > 0 && <button type="button" onClick={() => { setSubject(null); setKind("all"); }} className="mt-2 text-sm font-semibold text-[#346557] hover:underline">Clear filters</button>}
                            </div>
                        )}
                        {visible.map((post) => <Post key={post._id} post={post} openPost={() => setSelectedPost(post)} />)}
                    </section>
                </div>
            </div>
            {selectedPost && <PostModal key={selectedPost._id} post={selectedPost} closePost={() => setSelectedPost(null)} />}
        </div>
    );
}
