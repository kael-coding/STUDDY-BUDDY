import { FaHeart } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import Reply from "./Reply";
import { useCommunityStore } from "../../store/communityStore";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState, useRef } from "react";

const Comment = ({ comment, postId, replyInputs, setReplyInputs, onCommentDeleted }) => {
    const { likeUnlikeComment, replyOnComment, isLoading, isLiking, deleteComment, updateComment } = useCommunityStore();
    const { user } = useAuthStore();
    const userId = user._id;

    const [isLiked, setIsLiked] = useState(comment.likesComment?.includes(userId) || false);
    const [likeCount, setLikeCount] = useState(comment.likesComment?.length || 0);
    const [visibleReplyInput, setVisibleReplyInput] = useState({});
    const [isMenuOpen, setIsMenuOpen] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [localComment, setLocalComment] = useState(comment);
    const [isDeleted, setIsDeleted] = useState(false);

    const menuRef = useRef(null);
    const commentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && commentRef.current && !commentRef.current.contains(event.target)) {
                setIsMenuOpen({});
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (localComment && userId) {
            const liked = localComment.likesComment?.includes(userId) || false;
            setIsLiked(liked);
            setLikeCount(localComment.likesComment?.length || 0);
        }
    }, [localComment, userId]);



    const handleLike = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!userId) return;

        const originalIsLiked = isLiked;
        const originalLikeCount = likeCount;

        try {
            setIsLiked(!originalIsLiked);
            setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1);
            await likeUnlikeComment(localComment._id);
        } catch (error) {
            setIsLiked(originalIsLiked);
            setLikeCount(originalLikeCount);
            console.error('Error toggling like:', error);
        }
    };

    const handleReply = async () => {
        const replyContent = replyInputs[`${localComment._id}`]?.trim();
        if (!replyContent) return;

        try {
            await replyOnComment(localComment._id, replyContent);
            setReplyInputs(prev => ({ ...prev, [`${localComment._id}`]: "" }));
            setVisibleReplyInput(prev => ({ ...prev, [localComment._id]: false }));
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

    const handleDeleteComment = async () => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            setIsDeleted(true);
            if (onCommentDeleted) onCommentDeleted(localComment._id);
            await deleteComment(localComment._id);
        } catch (error) {
            setIsDeleted(false);
            console.error("Error deleting comment:", error);
        }
    };

    const handleEditComment = () => {
        setIsEditing(true);
        setIsMenuOpen({});
        setEditedText(localComment.text);
    };

    const handleUpdateComment = async () => {
        if (!editedText.trim()) return;

        try {
            setLocalComment(prev => ({
                ...prev,
                text: editedText,
                updatedAt: new Date().toISOString()
            }));

            await updateComment(localComment._id, { text: editedText });
            setIsEditing(false);
        } catch (error) {
            setLocalComment(comment);
            setEditedText(comment.text);
            console.error("Error updating comment:", error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedText(localComment.text);
    };

    if (isDeleted) return null;

    return (
        <div key={localComment._id} className="relative">
            <div ref={commentRef} className="flex gap-3 pt-3 relative items-start">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-xl flex-shrink-0">
                    {localComment.user?.profilePicture ? (
                        <img
                            src={localComment.user.profilePicture}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        <span>👤</span>
                    )}
                </div>

                <div className="flex-1">
                    {isEditing ? (
                        <div className="inline-block bg-white p-3 rounded-2xl relative w-full mb-2">
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleUpdateComment}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 bg-gray-300 rounded text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="inline-block bg-white p-3 rounded-2xl relative mb-2">
                            {/* Only show three dots if user is comment owner */}
                            {user._id === localComment.user?._id && (
                                <button
                                    onClick={() => toggleMenu(localComment._id)}
                                    className="absolute top-1/2 transform -translate-y-1/2 right-[-40px] text-gray-500 hover:text-black"
                                >
                                    <BsThreeDots />
                                </button>
                            )}

                            {/* Only show menu if open AND user is comment owner */}
                            {isMenuOpen[localComment._id] && user._id === localComment.user?._id && (
                                <div ref={menuRef} className="absolute right-[-40px] mt-2 w-28 bg-white border rounded-md shadow-md z-10 text-sm">
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                        onClick={() => {
                                            setIsMenuOpen(prev => ({ ...prev, [localComment._id]: false }));
                                            handleEditComment();
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                        onClick={() => {
                                            setIsMenuOpen(prev => ({ ...prev, [localComment._id]: false }));
                                            handleDeleteComment();
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}

                            <p className="text-sm font-semibold mb-1">
                                {localComment.user?.userName || "Anonymous"}
                            </p>
                            <p className="text-sm">{localComment.text}</p>
                        </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[#888] mb-2">
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
                                setVisibleReplyInput(prev => ({ ...prev, [localComment._id]: true }))}
                        >
                            Reply
                        </button>
                    </div>

                    {visibleReplyInput[localComment._id] && (
                        <div className="flex items-center gap-2 mt-1 mb-2">
                            <input
                                type="text"
                                className="flex-1 px-3 py-1 text-sm rounded-full bg-gray-200 outline-none"
                                placeholder="Write a reply..."
                                value={replyInputs[`${localComment._id}`] || ""}
                                onChange={(e) =>
                                    handleReplyInputChange(localComment._id, e.target.value)
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

                    {localComment.replies?.length > 0 && (
                        <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {localComment.replies.map((reply) => (
                                <Reply
                                    key={reply._id}
                                    reply={reply}
                                    postId={postId}
                                    commentId={localComment._id}
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