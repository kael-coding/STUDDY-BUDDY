import { FaHeart } from "react-icons/fa";
import { useCommunityStore } from "../../store/communityStore";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";

const formatTime = (createdAt) => {
    const now = new Date();
    const date = new Date(createdAt);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
};

const Reply = ({
    reply,
    postId,
    commentId,
    replyInputs,
    setReplyInputs,
    visibleReplyId,
    setVisibleReplyId
}) => {
    const {
        likeUnlikeReply,
        replyOnReply,
        likeUnlikeReplyToReply,
        isLoading
    } = useCommunityStore();
    const { user } = useAuthStore();
    const userId = user._id;

    const [timeAgo, setTimeAgo] = useState("Just now");
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (reply && userId) {
            const liked = reply.replyTo !== undefined
                ? reply.likesReplyToReply?.includes(userId)
                : reply.likesReply?.includes(userId);
            setIsLiked(liked || false);
            setLikeCount(
                reply.replyTo !== undefined
                    ? reply.likesReplyToReply?.length || 0
                    : reply.likesReply?.length || 0
            );
        }
    }, [reply, userId]);

    useEffect(() => {
        if (reply?.createdAt) {
            setTimeAgo(formatTime(reply.createdAt));
            const interval = setInterval(() => {
                setTimeAgo(formatTime(reply.createdAt));
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [reply?.createdAt]);

    const handleLike = async () => {
        try {
            const newLikeStatus = !isLiked;
            setIsLiked(newLikeStatus);
            setLikeCount(newLikeStatus ? likeCount + 1 : likeCount - 1);

            if (reply.replyTo !== undefined) {
                await likeUnlikeReplyToReply(commentId, reply.replyTo, reply._id);
            } else {
                await likeUnlikeReply(commentId, reply._id);
            }
        } catch (error) {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
            console.error("Error toggling like:", error);
        }
    };

    const handleReply = async () => {
        const replyContent = replyInputs[reply._id]?.trim();
        if (!replyContent) return;

        try {
            await replyOnReply(commentId, reply._id, replyContent);
            setReplyInputs(prev => ({ ...prev, [reply._id]: "" }));
            setVisibleReplyId(null);
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    const handleReplyInputChange = (replyId, value) => {
        setReplyInputs(prev => ({ ...prev, [replyId]: value }));
    };

    const showReplyInput = (replyId) => {
        setReplyInputs({ [replyId]: "" });
        setVisibleReplyId(replyId);
    };

    const replyUser = typeof reply.user === 'string'
        ? { _id: reply.user, userName: user.userName, profilePicture: user.profilePicture }
        : reply.user || {};

    const userName = replyUser?.userName || "Anonymous";
    const profilePicture = replyUser?.profilePicture;

    return (
        <div key={reply._id} className="space-y-3 ml-10">
            <div className="flex gap-3">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-xl">
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        <span>👤</span>
                    )}
                </div>
                <div className="flex-1">
                    <div className="inline-block bg-white p-3 rounded-2xl">
                        <p className="text-sm font-semibold mb-1">{userName}</p>
                        <p className="text-sm">{reply?.text}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-6 text-xs text-[#888]">
                        <span>{timeAgo}</span>
                        <button
                            onClick={handleLike}
                            disabled={isLoading}
                            className={`transition-all ${isLiked ? "text-red-500 font-semibold" : "text-gray-600"}`}
                        >
                            <FaHeart className="inline" />
                            {isLiked ? "Liked" : "Like"}
                            {likeCount > 0 ? ` (${likeCount})` : ""}
                        </button>
                        <button onClick={() => showReplyInput(reply._id)}>Reply</button>
                    </div>

                    {visibleReplyId === reply._id && (
                        <div className="flex items-center gap-2 mt-2 mb-5">
                            <input
                                type="text"
                                className="flex-1 px-3 py-1 text-sm rounded-full bg-gray-200 outline-none"
                                placeholder="Write a reply..."
                                value={replyInputs[reply._id] || ""}
                                onChange={(e) => handleReplyInputChange(reply._id, e.target.value)}
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

                    {reply?.replies?.length > 0 && reply.replies.map(nestedReply => (
                        <Reply
                            key={nestedReply._id}
                            reply={nestedReply}
                            postId={postId}
                            commentId={commentId}
                            replyInputs={replyInputs}
                            setReplyInputs={setReplyInputs}
                            visibleReplyId={visibleReplyId}
                            setVisibleReplyId={setVisibleReplyId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function ReplyWrapper({ reply, postId, commentId }) {
    const [visibleReplyId, setVisibleReplyId] = useState(null);
    const [replyInputs, setReplyInputs] = useState({});

    return (
        <Reply
            reply={reply}
            postId={postId}
            commentId={commentId}
            replyInputs={replyInputs}
            setReplyInputs={setReplyInputs}
            visibleReplyId={visibleReplyId}
            setVisibleReplyId={setVisibleReplyId}
        />
    );
}
