import { useState, useEffect } from "react";
import { FaHeart, FaCommentAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import Comment from "./Comment";
import { useCommunityStore } from "../../store/communityStore";
import { useAuthStore } from "../../store/authStore";

const PostModal = ({ post, closePost }) => {
    const [newComment, setNewComment] = useState("");
    const [replyInputs, setReplyInputs] = useState({});
    const { likeUnlikePost, commentOnPost, isLoading } = useCommunityStore();
    const { user } = useAuthStore();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const userId = user._id;

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
        if (!newComment.trim()) return;
        try {
            await commentOnPost(post._id, newComment);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <div
            className="fixed inset-0 backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-60 p-4 sm:p-6"
            onClick={closePost}
        >
            <div
                className="bg-white text-black rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b bg-[#5C8D7D] flex justify-between items-center text-white">
                    <h2 className="font-semibold text-lg truncate">
                        {post.user?.userName || "Anonymous"}'s Post
                    </h2>
                    <button
                        onClick={closePost}
                        className="text-2xl leading-none hover:bg-[#3a3b3c] p-1 rounded-full"
                        aria-label="Close Post Modal"
                    >
                        <IoMdClose />
                    </button>
                </div>

                {/* Post Content */}
                <div className="px-4 py-3 space-y-3 bg-gray-200 overflow-auto max-h-[30vh] sm:max-h-[40vh]">
                    <p className="text-base break-words">{post.text}</p>
                    {post.image && (
                        <img
                            src={post.image}
                            alt="Post"
                            className="rounded-lg w-full max-h-60 object-cover"
                            loading="lazy"
                        />
                    )}
                    <div className="flex gap-6 text-sm text-[#888]">
                        <button
                            onClick={handleLike}
                            disabled={isLoading}
                            className={`transition-all flex items-center gap-1 ${isLiked ? "text-red-500 font-semibold" : "text-gray-600"
                                }`}
                            aria-pressed={isLiked}
                        >
                            <FaHeart />
                            <span>{isLiked ? "Liked" : "Like"}</span>
                            {likeCount > 0 && <span>({likeCount})</span>}
                        </button>
                        <button className="flex items-center gap-1 text-gray-600 cursor-default">
                            <FaCommentAlt />
                            <span>{post.comments?.length || 0} Comments</span>
                        </button>
                    </div>
                </div>

                <div className="border-t border-[#3a3b3c]" />

                {/* Scrollable Comments Section */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[30vh] sm:max-h-[35vh]">
                    {post.comments?.length === 0 ? (
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
                <div className="px-4 py-3 bg-white flex items-center gap-3 border-t">
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
                        className="flex-1 bg-gray-300 rounded-full px-4 py-2 text-sm outline-none placeholder-[#888]"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleComment()}
                        aria-label="Write a comment"
                    />
                    <button
                        onClick={handleComment}
                        disabled={isLoading || !newComment.trim()}
                        className="text-sm text-[#5C8D7D] py-1 px-3 rounded-full hover:bg-[#4a7d65] hover:text-white transition-all disabled:opacity-50"
                    >
                        Comment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostModal;
