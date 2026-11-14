import { useEffect, useState } from "react";
import PostForm from "@/components/ComunityComponents/PostForm.jsx";
import Post from "@/components/ComunityComponents/Post.jsx";
import PostModal from "@/components/ComunityComponents/PostModal.jsx";
import { useCommunityStore } from "@/store/communityStore.js";

const Community = () => {
    const { posts, getPosts, selectedPost, setSelectedPost, isLoading, error } = useCommunityStore();
    const [subject, setSubject] = useState("all");
    const [kind, setKind] = useState("all");
    const spaces = new Map();
    for (const post of posts) {
        const label = post.subject?.trim() || "General";
        spaces.set("subject:" + (post.subject?.trim().toLowerCase() || ""), label);
    }
    if (!spaces.has(subject) && subject !== "all") spaces.set(subject, subject.slice(8) || "General");
    const visible = posts.filter((post) =>
        (subject === "all" || subject === "subject:" + (post.subject?.trim().toLowerCase() || "")) &&
        (kind === "all" || kind === (post.studyKind || "discussion")),
    );

    useEffect(() => {
        getPosts();
    }, [getPosts]);

    const openPost = (postId) => {
        setSelectedPost(posts.find(p => p._id === postId));
    };

    const closePost = () => setSelectedPost(null);

    return (
        <div className="mx-auto max-w-4xl space-y-5 p-2 sm:p-6">
            <h1 className="text-3xl font-bold tracking-tight text-[#233e35]">Study Groups</h1>
            <div className="flex flex-wrap gap-3">
                <label className="text-sm font-medium">Subject space
                    <select value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 block rounded border bg-white p-2">
                        <option value="all">All subjects</option>
                        {Array.from(spaces).sort((a, b) => a[1].localeCompare(b[1])).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                </label>
                <label className="text-sm font-medium">Show
                    <select value={kind} onChange={(event) => setKind(event.target.value)} className="mt-1 block rounded border bg-white p-2">
                        <option value="all">All posts</option><option value="question">Questions</option>
                        <option value="resource">Resources</option><option value="session">Review sessions</option>
                        <option value="discussion">Discussions</option>
                    </select>
                </label>
            </div>
            <PostForm initialSubject={subject !== "subject:" ? spaces.get(subject) || "" : ""} />

            {error && (
                <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
                    {error} <button type="button" onClick={getPosts} className="underline">Reload feed</button>
                </p>
            )}
            {isLoading && posts.length === 0 && <p role="status">Loading posts…</p>}
            {!isLoading && !error && visible.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">{posts.length ? "No posts match this view." : "No posts yet. Be the first to share something!"}</p>
                </div>
            ) : (
                visible.map(post => (
                    <Post
                        key={post._id}
                        post={post}
                        openPost={openPost}
                    />
                ))
            )}

            {selectedPost && (
                <PostModal
                    post={selectedPost}
                    closePost={closePost}
                />
            )}
        </div>
    );
};

export default Community;
