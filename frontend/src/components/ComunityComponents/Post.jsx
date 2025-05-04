import { FaHeart, FaCommentAlt } from "react-icons/fa";
import { useCommunityStore } from "../../store/communityStore";
import { useEffect, useState } from "react";

const Post = ({ post, openPost }) => {
    const { likeUnlikePost, isLoading, userId } = useCommunityStore();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (post && userId) {
            const userHasLiked = post.likes?.includes(userId) || false;
            setIsLiked(userHasLiked);
            setLikeCount(post.likes?.length || 0);
        }
    }, [post, userId]);

    const handleLike = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!userId) {
            console.log("User not logged in");
            return;
        }

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

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer">
            {/* Author section */}
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {post.user?.profilePicture ? (
                        <img
                            src={post.user.profilePicture}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-lg">👤</span>
                    )}
                </div>
                <p className="font-semibold text-lg">{post.user?.userName || "Anonymous"}</p>
            </div>

            {/* Post content */}
            <p className="text-gray-800 text-lg mb-4">{post.text}</p>
            {post.image && (
                <img
                    src={post.image}
                    alt="Post content"
                    className="rounded-lg w-full h-auto max-h-[500px] object-cover mb-4"
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            {/* Like/comment counts */}
            <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                    <FaHeart className="text-red-500" />
                    <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
                </div>
                <span>{post.comments?.length || 0} comment{post.comments?.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 text-[#5C8D7D] justify-between items-center border-t border-b border-gray-200 py-2">
                <button
                    onClick={handleLike}
                    disabled={isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 py-1 rounded-md transition-all ${isLiked
                        ? "text-red-500 font-semibold hover:text-red-600"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <FaHeart className={isLiked ? "fill-current" : ""} />
                    <span>{isLiked ? "Liked" : "Like"}</span>
                    {likeCount > 0 && <span className="text-xs">({likeCount})</span>}
                </button>
                <button
                    className="flex-1 flex items-center justify-center gap-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        openPost(post._id);
                    }}
                >
                    <FaCommentAlt />
                    <span>Comment</span>
                </button>
            </div>
        </div>
    );
};

export default Post;