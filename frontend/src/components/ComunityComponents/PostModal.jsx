import { useState, useEffect } from "react";
import { FaHeart, FaCommentAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import Comment from "./Comment";
import { useCommunityStore } from "../../store/communityStore";

const PostModal = ({ post, closePost }) => {
    const [newComment, setNewComment] = useState("");
    const [replyInputs, setReplyInputs] = useState({});
    const { likeUnlikePost, commentOnPost, isLoading, userId } = useCommunityStore();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // Initialize like status when component mounts
    useEffect(() => {
        if (post && userId) {
            const userHasLiked = post.likes?.includes(userId) || false;
            setIsLiked(userHasLiked);
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
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-20">
            <div
                className="bg-white text-black rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b bg-[#5C8D7D] flex justify-between items-center text-white">
                    <h2 className="font-semibold text-lg">
                        {post.user?.userName || "Anonymous"}'s Post
                    </h2>
                    <button
                        onClick={closePost}
                        className="text-2xl leading-none hover:bg-[#3a3b3c] p-1 rounded-full"
                    >
                        <IoMdClose />
                    </button>
                </div>

                {/* Post Content */}
                <div className="px-6 py-4 space-y-4 bg-gray-200">
                    <p className="text-base">{post.text}</p>
                    {post.image && (
                        <img
                            src={post.image}
                            alt=""
                            className="rounded-lg w-full max-h-[400px] object-cover"
                        />
                    )}
                    <div className="flex gap-8 text-sm text-[#888]">
                        <button
                            onClick={handleLike}
                            disabled={isLoading}
                            className={`transition-all ${isLiked ? "text-red-500 font-semibold" : "text-gray-600"}`}
                        >
                            <FaHeart className="inline" />
                            {isLiked ? "Liked" : "Like"}
                            {likeCount > 0 ? `(${likeCount})` : ""}
                        </button>
                        <button>
                            <FaCommentAlt className="inline" /> {post.comments?.length || 0} Comments
                        </button>
                    </div>
                </div>

                <div className="border-t border-[#3a3b3c]" />

                {/* Scrollable Comments Section */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    {post.comments?.length === 0 ? (
                        <p className="text-center text-gray-500">No comments yet</p>
                    ) : (
                        post.comments?.map(comment => (
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
                <div className="px-6 py-3 bg-white flex items-center gap-4 border-t">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                        {post.user?.profilePicture ? (
                            <img
                                src={post.user.profilePicture}
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
                        onKeyPress={(e) => e.key === 'Enter' && handleComment()}
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