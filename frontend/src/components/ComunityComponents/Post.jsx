import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Ellipsis, Flag, Heart, MessageSquare } from 'lucide-react';
import { useCommunityStore } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import UpdatePostModal from './UpdatePostModal';
import DeletePostModal from './DeletePostModal';
import ReportPostDialog from './ReportPostDialog.jsx';
import { formatDistanceToNow } from 'date-fns';
import PostImage from './PostImage.jsx';
import { postTypes, subjectLabel } from './communityFeed.js';

const sessionFormat = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short",
});

const Post = ({ post, openPost }) => {
    const { likeUnlikePost, isLiking, deletePost, updatePost } = useCommunityStore();
    const { user } = useAuthStore();
    const userId = user?._id;

    const isLiked = Boolean(post.likedByYou || (userId && post.likes?.some((like) => String(like?._id ?? like) === String(userId))));
    const likeCount = post.likes?.length ?? 0;
    const commentCount = post.comments?.length ?? 0;
    const author = post.user?.userName || "Anonymous";
    const [activeMenuPostId, setActiveMenuPostId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reported, setReported] = useState(false);
    const menuRef = useRef(null);

    // Format the post creation date
    const formatDate = (dateString) => {
        const timestamp = Date.parse(dateString);
        return Number.isFinite(timestamp) ? formatDistanceToNow(timestamp, { addSuffix: true }) : "";
    };

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
        if (!userId || isLiking) return;

        try {
            await likeUnlikePost(post._id);
        } catch (error) {
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
            {showReportDialog && (
                <ReportPostDialog
                    postId={post._id}
                    onClose={() => setShowReportDialog(false)}
                    onReported={() => {
                        setReported(true);
                        setShowReportDialog(false);
                    }}
                />
            )}
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

            <article
                className="relative rounded-xl border border-[#dce7e1] bg-white p-4 sm:p-5"
                onClick={handlePostClick}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e7f0ec] font-semibold text-[#346557]">
                            {post.user?.profilePicture ? (
                                <img
                                    src={post.user.profilePicture}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span aria-hidden="true">{author.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-[#233e35] [overflow-wrap:anywhere]">{author}</p>
                            <p className="text-xs text-[#526c62]">{formatDate(post.createdAt)}</p>
                        </div>
                    </div>

                    {userId && userId !== post.user?._id && (
                        <button
                            type="button"
                            disabled={reported}
                            onClick={() => setShowReportDialog(true)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[#526c62] hover:bg-[#f0f6f2] disabled:opacity-60"
                        >
                            <Flag size={14} aria-hidden="true" /> {reported ? "Reported" : "Report post"}
                        </button>
                    )}
                    {userId === post.user?._id && (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={toggleMenu}
                                aria-label="Post options" aria-expanded={activeMenuPostId === post._id}
                                className="rounded-lg p-1.5 text-[#526c62] hover:bg-[#e7f0ec]"
                            >
                                <Ellipsis size={20} aria-hidden="true" />
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
                    <div className="mb-3 flex flex-wrap gap-2 text-xs font-medium">
                        <span className="rounded-md bg-[#e7f0ec] px-2 py-1 text-[#346557] [overflow-wrap:anywhere]">{subjectLabel(post.subject)}</span>
                        <span className="rounded-md border border-[#dce7e1] px-2 py-1 text-[#526c62]">{postTypes[post.studyKind] || postTypes.discussion}</span>
                    </div>
                    {post.studyKind === "session" && Number.isFinite(Date.parse(post.sessionAt)) && (
                        <p className="mb-3 flex items-center gap-2 rounded-lg bg-[#f0f6f2] p-2.5 text-sm text-[#346557]">
                            <CalendarClock size={16} className="shrink-0" aria-hidden="true" />
                            <span><time dateTime={post.sessionAt}>{sessionFormat.format(Date.parse(post.sessionAt))}</time> Manila time</span>
                        </p>
                    )}
                    {post.text && <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#233e35] [overflow-wrap:anywhere] sm:text-base">{post.text}</p>}
                    {post.image && <PostImage key={post.image} src={post.image} />}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-[#edf2ef] pt-3 text-sm">
                    <button
                        onClick={handleLike}
                        type="button" aria-pressed={isLiked} disabled={isLiking}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium
                            ${isLiked
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'text-[#526c62] hover:bg-[#f0f6f2]'
                            }`}
                    >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                        <span className="text-xs tabular-nums">{likeCount}</span>
                    </button>
                    <button
                        type="button" className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-[#526c62] hover:bg-[#f0f6f2]"
                        onClick={(e) => {
                            e.stopPropagation();
                            openPost(post._id);
                        }}
                    >
                        <MessageSquare size={16} aria-hidden="true" />
                        <span>Comments</span>
                        <span className="text-xs tabular-nums">{commentCount}</span>
                    </button>
                </div>
            </article>
        </>
    );
};

export default Post;
