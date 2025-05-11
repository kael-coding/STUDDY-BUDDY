import { useEffect, useRef, useState } from 'react';
import { FaHeart, FaCommentAlt } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import UpdatePostModal from './UpdatePostModal'; // Make sure this path is correct
import DeletePostModal from './DeletePostModal'; // Import DeletePostModal

const Post = ({ post, openPost }) => {
    const { likeUnlikePost, isLoading, deletePost, updatePost } = useCommunityStore();
    const { user } = useAuthStore();
    const userId = user?._id;

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [activeMenuPostId, setActiveMenuPostId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        console.log(post)
        if (post && userId) {
            const userHasLiked = post.likedByYou || false;
            setIsLiked(userHasLiked);
            setLikeCount(post.likes?.length || 0);
        }
    }, [post, userId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuPostId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLike = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!userId) return;

        try {
            const newLikeStatus = !isLiked;
            setIsLiked(newLikeStatus);
            setLikeCount(newLikeStatus ? likeCount + 1 : likeCount - 1);
            await likeUnlikePost(post._id);
        } catch (error) {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
            console.error('Error toggling like:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePost(post._id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    const handleUpdate = (e) => {
        e.stopPropagation();
        setActiveMenuPostId(null);
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = async (updatedData) => {
        try {
            await updatePost(post._id, updatedData);
            setShowUpdateModal(false);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        setActiveMenuPostId(prev => (prev === post._id ? null : post._id));
    };

    const handlePostClick = (e) => {
        if (!e.target.closest('button') && !e.target.closest('a')) {
            openPost(post._id);
        }
    };

    return (
        <>
            {showUpdateModal && (
                <UpdatePostModal
                    post={post}
                    onClose={() => setShowUpdateModal(false)}
                    onSubmit={handleUpdateSubmit}
                />
            )}

            {showDeleteModal && (
                <DeletePostModal
                    onClose={() => setShowDeleteModal(false)}
                    onDelete={handleDelete}
                />
            )}

            <div
                className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={handlePostClick}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
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
                        <p className="font-semibold text-lg">{post.user?.userName || 'Anonymous'}</p>
                    </div>

                    {userId === post.user?._id && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={toggleMenu}
                                className="text-gray-600 hover:text-black"
                            >
                                <BsThreeDots size={20} />
                            </button>

                            {activeMenuPostId === post._id && (
                                <div className="absolute right-0 z-10 mt-2 w-28 bg-white border border-gray-200 rounded shadow-md">
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                        onClick={handleUpdate}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuPostId(null);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <p className="text-gray-800 text-lg">{post.text}</p>
                    {post.image && (
                        <img
                            src={post.image}
                            alt="Post content"
                            className="rounded-lg w-full h-auto max-h-[500px] object-cover mt-3"
                        />
                    )}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                        <FaHeart className="text-red-500" />
                        <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>
                    </div>
                    <span>{post.comments?.length || 0} comment{post.comments?.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="flex gap-4 text-[#5C8D7D] justify-between items-center border-t border-b border-gray-200 py-2">
                    <button
                        onClick={handleLike}
                        disabled={isLoading}
                        className={`flex-1 flex items-center justify-center gap-2 py-1 rounded-md transition-all
                            ${isLiked
                                ? 'bg-red-100 text-red-600 font-semibold hover:bg-red-200'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FaHeart className={`text-lg ${isLiked ? 'text-red-500' : 'text-gray-500'}`} />
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
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
        </>
    );
};

export default Post;
