import { useState, useEffect, useRef } from "react";
import { FaHeart, FaCommentAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import Comment from "./Comment";
import { useCommunityStore } from "@/store/communityStore";
import { useAuthStore } from "@/store/authStore";
import PostImage from "./PostImage.jsx";

const PostModal = ({ post, closePost }) => {
    const [newComment, setNewComment] = useState("");
    const [replyInputs, setReplyInputs] = useState({});
    const { likeUnlikePost, commentOnPost, isLiking, isCommenting } = useCommunityStore();
    const { user } = useAuthStore();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const userId = user._id;
    const dialog = useRef(null);

    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        return () => element.close();
    }, []);

    useEffect(() => {
        if (post && userId) {
            const userHasLiked =
                post.likedByYou ||
                post.likes?.some(
                    (like) =>
                        (like._id ? like._id.toString() : like.toString()) === userId.toString()
                );
            setIsLiked(!!userHasLiked);
            setLikeCount(post.likes?.length || 0);
        }
    }, [post, userId]);

    const handleLike = async () => {
        try {
            // Optimistic UI update
            const newLikeStatus = !isLiked;
            setIsLiked(newLikeStatus);
            setLikeCount(newLikeStatus ? likeCount + 1 : likeCount - 1);

            await likeUnlikePost(post._id);
        } catch (error) {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
            console.error("Error toggling like:", error);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim() || isCommenting) return;
        try {
            await commentOnPost(post._id, newComment);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <dialog ref={dialog} aria-labelledby="post-thread-title" onCancel={(event) => { event.preventDefault(); closePost(); }}
            className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-xl border border-[#dce7e1] bg-white p-0 text-[#233e35] shadow-xl backdrop:bg-[#1f3430]/55"
            onClick={(event) => { if (event.target === event.currentTarget) closePost(); }}>
            <div
                className="flex max-h-[90dvh] flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#dce7e1] px-4 py-3">
                    <h2 id="post-thread-title" className="truncate font-semibold">
                        {post.user?.userName || "Anonymous"}'s Post
                    </h2>
                    <button
                        onClick={closePost}
                        className="shrink-0 rounded-lg p-1 text-xl hover:bg-[#e7f0ec]"
                        aria-label="Close Post Modal"
                    >
                        <IoMdClose />
                    </button>
                </div>

                {/* Post Content */}
                <div className="max-h-[35dvh] space-y-3 overflow-auto bg-[#f8faf9] px-4 py-3">
                    {post.text && <p className="whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">{post.text}</p>}
                    {post.image && <PostImage key={post.image} src={post.image} />}
                    <div className="flex gap-6 text-sm text-[#888]">
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`transition-all flex items-center gap-1 ${isLiked ? "text-red-500 font-semibold" : "text-gray-600"
                                }`}
                            aria-pressed={isLiked}
                        >
                            <FaHeart />
                            <span>{isLiked ? "Liked" : "Like"}</span>
                            {likeCount > 0 && <span>({likeCount})</span>}
                        </button>
                        <span className="flex items-center gap-1 text-[#526c62]">
                            <FaCommentAlt aria-hidden="true" />
                            <span>{post.comments?.length || 0} Comments</span>
                        </span>
                    </div>
                </div>

                {/* Scrollable Comments Section */}
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto border-t border-[#dce7e1] px-4 py-3">
                    {!post.comments?.length ? (
                        <p className="text-center text-gray-500">No comments yet</p>
                    ) : (
                        post.comments?.map((comment) => (
                            <Comment
                                key={comment._id}
                                comment={comment}
                                postId={post._id}
                                replyInputs={replyInputs}
                                setReplyInputs={setReplyInputs}
                            />
                        ))
                    )}
                </div>

                {/* Comment Input */}
                <form onSubmit={(event) => { event.preventDefault(); handleComment(); }}
                    className="flex shrink-0 items-center gap-2 border-t border-[#dce7e1] px-4 py-3">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-xl overflow-hidden">
                        {user?.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="h-full w-full rounded-full object-cover"
                            />
                        ) : (
                            <span>👤</span>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        className="min-w-0 flex-1 rounded-lg border border-[#cbd9d1] bg-[#f8faf9] px-3 py-2 text-sm focus-visible:outline-[#346557]"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        aria-label="Write a comment"
                    />
                    <button
                        type="submit" disabled={isCommenting || !newComment.trim()}
                        className="rounded-lg bg-[#346557] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        Comment
                    </button>
                </form>
            </div>
        </dialog>
    );
};

export default PostModal;
