import { FaHeart } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import Reply from "./Reply";
import { useCommunityStore } from "../../store/communityStore";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState, useRef } from "react";

const formatTime = (createdAt) => {
    if (!createdAt) return "Just now";
    const now = new Date();
    const date = new Date(createdAt);
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
};

const Comment = ({ comment, postId, replyInputs, setReplyInputs }) => {
    const { likeUnlikeComment, replyOnComment, isLoading, isLiking } = useCommunityStore();
    const { user } = useAuthStore();
    const [timeAgo, setTimeAgo] = useState("Just now");
    const userId = user._id;

    const [isLiked, setIsLiked] = useState(comment.likesComment?.includes(userId) || false);
    const [likeCount, setLikeCount] = useState(comment.likesComment?.length || 0);
    const [visibleReplyInput, setVisibleReplyInput] = useState({});
    const [isMenuOpen, setIsMenuOpen] = useState({});

    const menuRef = useRef(null);  // Ref for the dropdown menu
    const commentRef = useRef(null); // Ref for the comment bubble

    useEffect(() => {
        // Close the menu if click is outside of the comment or menu
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && commentRef.current && !commentRef.current.contains(event.target)) {
                setIsMenuOpen({});
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (comment && userId) {
            const liked = comment.likesComment?.includes(userId) || false;
            setIsLiked(liked);
            setLikeCount(comment.likesComment?.length || 0);
        }
    }, [comment, userId]);

    useEffect(() => {
        if (comment?.createdAt) {
            setTimeAgo(formatTime(comment.createdAt));
            const interval = setInterval(() => {
                setTimeAgo(formatTime(comment.createdAt));
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [comment?.createdAt]);

    const handleLike = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!userId) return;

        const originalIsLiked = isLiked;
        const originalLikeCount = likeCount;

        try {
            setIsLiked(!originalIsLiked);
            setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1);
            await likeUnlikeComment(comment._id);
        } catch (error) {
            setIsLiked(originalIsLiked);
            setLikeCount(originalLikeCount);
            console.error('Error toggling like:', error);
        }
    };

    const handleReply = async () => {
        const replyContent = replyInputs[`${comment._id}`]?.trim();
        if (!replyContent) return;

        try {
            await replyOnComment(comment._id, replyContent);
            setReplyInputs(prev => ({ ...prev, [`${comment._id}`]: "" }));
            setVisibleReplyInput(prev => ({ ...prev, [comment._id]: false }));
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    const handleReplyInputChange = (commentId, value) => {
        setReplyInputs(prev => ({ ...prev, [`${commentId}`]: value }));
    };

    const toggleMenu = (commentId) => {
        setIsMenuOpen((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    return (
        <div key={comment._id} className="relative space-y-3">
            {/* Comment Bubble */}
            <div ref={commentRef} className="flex gap-3 pt-6 relative justify-center items-start">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-xl ">
                    {comment.user?.profilePicture ? (
                        <img
                            src={comment.user.profilePicture}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        <span>👤</span>
                    )}
                </div>

                <div className="flex-1">
                    <div className="inline-block bg-white p-3 rounded-2xl relative">
                        {/* Three Dots Dropdown outside the Comment Bubble */}
                        <button
                            onClick={() => toggleMenu(comment._id)}
                            className="absolute top-1/2 transform -translate-y-1/2 right-[-40px] text-gray-500 hover:text-black"
                        >
                            <BsThreeDots />
                        </button>

                        {isMenuOpen[comment._id] && (
                            <div ref={menuRef} className="absolute right-[-40px] mt-2 w-28 bg-white border rounded-md shadow-md z-10 text-sm">
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={() => {
                                        setIsMenuOpen(prev => ({ ...prev, [comment._id]: false }));
                                        // TODO: Add edit logic here
                                        alert("Edit clicked!");
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                    onClick={() => {
                                        setIsMenuOpen(prev => ({ ...prev, [comment._id]: false }));
                                        // TODO: Add delete logic here
                                        alert("Delete clicked!");
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}

                        <p className="text-sm font-semibold mb-1">
                            {comment.user?.userName || "Anonymous"}
                        </p>
                        <p className="text-sm">{comment.text}</p>
                    </div>
                    <div className="mt-1 mb-5 flex items-center gap-6 text-xs text-[#888]">
                        <span>{timeAgo}</span>
                        <button
                            onClick={handleLike}
                            disabled={isLoading || isLiking}
                            className={`transition-all ${isLiked ? "text-red-500 font-semibold" : "text-gray-600"}`}
                        >
                            <FaHeart className="inline" />
                            {isLiked ? "Liked" : "Like"}
                            {likeCount > 0 && ` (${likeCount})`}
                        </button>
                        <button
                            onClick={() =>
                                setVisibleReplyInput(prev => ({ ...prev, [comment._id]: true }))}
                        >
                            Reply
                        </button>
                    </div>

                    {visibleReplyInput[comment._id] && (
                        <div className="flex items-center gap-2 mt-2 mb-5">
                            <input
                                type="text"
                                className="flex-1 px-3 py-1 text-sm rounded-full bg-gray-200 outline-none"
                                placeholder="Write a reply..."
                                value={replyInputs[`${comment._id}`] || ""}
                                onChange={(e) =>
                                    handleReplyInputChange(comment._id, e.target.value)
                                }
                            />
                            <button
                                onClick={handleReply}
                                disabled={isLoading}
                                className="text-sm bg-[#5C8D7D] text-white px-4 py-1 rounded-full"
                            >
                                Reply
                            </button>
                        </div>
                    )}

                    {comment.replies?.length > 0 && (
                        <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {comment.replies.map((reply) => (
                                <Reply
                                    key={reply._id}
                                    reply={reply}
                                    postId={postId}
                                    commentId={comment._id}
                                    replyInputs={replyInputs}
                                    setReplyInputs={setReplyInputs}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comment;
