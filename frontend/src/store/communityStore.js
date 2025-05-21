import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000/api/community' : '/api/community';
axios.defaults.withCredentials = true;

export const useCommunityStore = create((set, get) => ({
    posts: [],
    likedPosts: [],
    isLoading: false,
    error: null,
    isCreatingPost: false,
    isUpdatingPost: false,
    isDeletingPost: false,
    isReplying: false,
    isCommenting: false,
    isLiking: false,
    userId: '',

    getPosts: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get(`${API_URL}/all`);
            const posts = res.data.userPost?.posts || [];

            set({
                posts: posts.map(post => ({
                    ...post,
                    likedByYou: post.likedByYou || false,
                    comments: post.comments?.map(comment => ({
                        ...comment,
                        likedByYou: comment.likedByYou || false,
                        replies: comment.replies?.map(reply => ({
                            ...reply,
                            likedByYou: reply.likedByYou || false,
                            replies: reply.replies?.map(nestedReply => ({
                                ...nestedReply,
                                likedByYou: nestedReply.likedByYou || false
                            })) || []
                        })) || []
                    })) || []
                })),
                isLoading: false,
                error: null,
            });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error fetching posts',
                isLoading: false
            });
            toast.error(err.response?.data?.message || 'Error fetching posts');
        }
    },

    setSelectedPost: (post) => set({ selectedPost: post }),

    getPostById: async (postId) => {
        set({ isLoading: true });
        try {
            const res = await axios.get(`${API_URL}/yourpost/${postId}`);
            set({ posts: [res.data.post], isLoading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error fetching post', isLoading: false });
            toast.error(err.response?.data?.message || 'Error fetching post');
        }
    },

    getLikedPosts: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get(`${API_URL}/liked`);
            set({ likedPosts: res.data.posts || [], isLoading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error fetching liked posts', isLoading: false });
            toast.error(err.response?.data?.message || 'Error fetching liked posts');
        }
    },

    createPost: async (formData, userData) => {  // Add userData parameter
        set({ isCreatingPost: true });
        try {
            const res = await axios.post(`${API_URL}/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            set((state) => ({
                posts: [{
                    ...res.data.newPost,
                    user: userData,  // Use passed user data
                    likedByYou: false
                }, ...state.posts],
                isCreatingPost: false
            }));
            toast.success('Post created successfully');
            return res.data.newPost;
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error creating post',
                isCreatingPost: false
            });
            toast.error(err.response?.data?.message || 'Error creating post');
            throw err;
        }
    },

    updatePost: async (postId, postData) => {
        set({ isUpdatingPost: true });
        try {
            const res = await axios.put(`${API_URL}/edit-post/${postId}`, postData);
            set((state) => ({
                posts: state.posts.map(post =>
                    post._id === postId ? {
                        ...res.data.updatedPost,
                        user: post.user,
                        likedByYou: post.likedByYou
                    } : post
                ),
                isUpdatingPost: false
            }));
            toast.success('Post updated successfully');
            return res.data.updatedPost;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error updating post', isUpdatingPost: false });
            toast.error(err.response?.data?.message || 'Error updating post');
            throw err;
        }
    },
    deletePost: async (postId) => {
        set({ isDeletingPost: true });
        try {
            await axios.delete(`${API_URL}/delete-post/${postId}`);
            set((state) => ({
                posts: state.posts.filter(post => post._id !== postId),
                isDeletingPost: false
            }));
            toast.success('Post deleted successfully');
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error deleting post', isDeletingPost: false });
            toast.error(err.response?.data?.message || 'Error deleting post');
            throw err;
        }
    },


    // In your community store
    likeUnlikePost: async (postId) => {
        set({ isLiking: true });
        try {
            const response = await axios.post(`${API_URL}/like/${postId}`);
            const updatedPost = response.data.post;

            set(prev => {
                const updatedPosts = prev.posts.map(post =>
                    post._id === postId
                        ? {
                            ...post,
                            likes: updatedPost.likes,
                            likedByYou: updatedPost.likedByYou
                        }
                        : post
                );

                const updatedSelectedPost = prev.selectedPost?._id === postId
                    ? {
                        ...prev.selectedPost,
                        likes: updatedPost.likes,
                        likedByYou: updatedPost.likedByYou
                    }
                    : prev.selectedPost;

                return {
                    posts: updatedPosts,
                    selectedPost: updatedSelectedPost,
                    isLiking: false
                };
            });
        } catch (err) {
            set({ isLiking: false });
            toast.error(err.response?.data?.message || 'Error toggling like');
            throw err;
        }
    },

    commentOnPost: async (postId, commentText) => {
        set({ isCommenting: true });
        try {
            const res = await axios.post(`${API_URL}/comment/${postId}`, { text: commentText });
            set((state) => ({
                posts: state.posts.map(post =>
                    post._id === postId ? res.data.post : post
                ),
                selectedPost: state.selectedPost?._id === postId
                    ? res.data.post
                    : state.selectedPost,
                isCommenting: false
            }));
            toast.success('Comment added');
            return res.data.post;
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error adding comment',
                isCommenting: false
            });
            toast.error(err.response?.data?.message || 'Error adding comment');
            throw err;
        }
    },

    updateComment: async (commentId, commentData) => {
        set({ isUpdatingPost: true });
        try {
            const res = await axios.put(`${API_URL}/edit-comment/${commentId}`, commentData);
            set((state) => ({
                posts: state.posts.map(post => {
                    const updatedComments = post.comments.map(comment =>
                        comment._id === commentId ? { ...comment, ...commentData } : comment
                    );
                    return { ...post, comments: updatedComments };
                }),
                isUpdatingPost: false
            }));
            toast.success('Comment updated');
            return res.data.post;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error updating comment', isUpdatingPost: false });
            toast.error(err.response?.data?.message || 'Error updating comment');
            throw err;
        }
    },


    deleteComment: async (commentId) => {
        set({ isDeletingPost: true });
        try {
            await axios.delete(`${API_URL}/delete-comment/${commentId}`);
            set((state) => ({
                posts: state.posts.map(post => ({
                    ...post,
                    comments: post.comments.filter(comment => comment._id !== commentId)
                })),
                isDeletingPost: false
            }));
            toast.success('Comment deleted');
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error deleting comment', isDeletingPost: false });
            toast.error(err.response?.data?.message || 'Error deleting comment');
            throw err;
        }
    },

    likeUnlikeComment: async (commentId) => {
        set({ isLiking: true });
        try {
            const { data } = await axios.post(`${API_URL}/like/comment/${commentId}`);

            // Update state based on server response
            set((state) => ({
                posts: state.posts.map(post => ({
                    ...post,
                    comments: post.comments.map(comment => {
                        if (comment._id === commentId) {
                            return {
                                ...comment,
                                likesComment: data.updatedComment.likesComment || []
                            };
                        }
                        return comment;
                    })
                })),
                selectedPost: state.selectedPost ? {
                    ...state.selectedPost,
                    comments: state.selectedPost.comments.map(comment => {
                        if (comment._id === commentId) {
                            return {
                                ...comment,
                                likesComment: data.updatedComment.likesComment || []
                            };
                        }
                        return comment;
                    })
                } : state.selectedPost,
                isLiking: false
            }));
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error toggling comment like',
                isLiking: false
            });
            throw err;
        }
    },

    replyOnComment: async (commentId, replyText) => {
        set({ isReplying: true });
        try {
            const res = await axios.post(`${API_URL}/comment/${commentId}/reply`, { text: replyText });
            set((state) => ({
                posts: state.posts.map(post =>
                    post._id === res.data.post._id ? res.data.post : post
                ),
                selectedPost: res.data.post,
                isReplying: false
            }));
            toast.success('Reply added');
            return res.data.post;
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error adding reply',
                isReplying: false
            });
            toast.error(err.response?.data?.message || 'Error adding reply');
            throw err;
        }
    },


    replyOnReply: async (commentId, replyId, replyText) => {
        set({ isReplying: true });
        try {
            const res = await axios.post(`${API_URL}/comment/${commentId}/reply/${replyId}`, { text: replyText });
            set((state) => ({
                posts: state.posts.map(post =>
                    post._id === res.data.post._id ? res.data.post : post
                ),
                selectedPost: res.data.post,
                isReplying: false
            }));
            toast.success('Reply added');
            return res.data.post;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error adding reply', isReplying: false });
            toast.error(err.response?.data?.message || 'Error adding reply');
            throw err;
        }
    },

    likeUnlikeReply: async (commentId, replyId) => {
        set({ isLiking: true });
        try {
            await axios.post(`${API_URL}/comment/${commentId}/reply/${replyId}/like`);
            set((state) => ({
                posts: state.posts.map(post => ({
                    ...post,
                    comments: post.comments.map(comment => {
                        if (comment._id === commentId) {
                            const updatedReplies = comment.replies.map(reply => {
                                if (reply._id === replyId) {
                                    const isLiked = reply.likesReply?.includes(get().userId);
                                    return {
                                        ...reply,
                                        likesReply: isLiked
                                            ? reply.likesReply.filter(id => id !== get().userId)
                                            : [...(reply.likesReply || []), get().userId]
                                    };
                                }
                                return reply;
                            });
                            return { ...comment, replies: updatedReplies };
                        }
                        return comment;
                    })
                })),
                isLiking: false
            }));
        } catch (err) {
            set({ error: err.response?.data?.message || 'Error toggling reply like', isLiking: false });
            toast.error(err.response?.data?.message || 'Error toggling reply like');
            throw err;
        }
    },

    likeUnlikeReplyToReply: async (commentId, parentReplyId, replyId) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(
                `${API_URL}/comment/${commentId}/reply/${parentReplyId}/reply/${replyId}/like`
            );

            if (response.data.success) {
                set(prev => ({
                    posts: prev.posts.map(post => {
                        const updatedComments = post.comments.map(comment => {
                            if (comment._id === commentId) {
                                const updatedReplies = comment.replies.map(reply => {
                                    if (reply._id === parentReplyId) {
                                        const updatedNestedReplies = reply.replies.map(nested => {
                                            if (nested._id === replyId) {
                                                return {
                                                    ...nested,
                                                    likes: response.data.updatedReply.likes,
                                                    likedByYou: response.data.updatedReply.likedByYou,
                                                    likeCount: response.data.updatedReply.likeCount
                                                };
                                            }
                                            return nested;
                                        });
                                        return {
                                            ...reply,
                                            replies: updatedNestedReplies
                                        };
                                    }
                                    return reply;
                                });
                                return {
                                    ...comment,
                                    replies: updatedReplies
                                };
                            }
                            return comment;
                        });
                        return {
                            ...post,
                            comments: updatedComments
                        };
                    }),
                    isLoading: false
                }));
            }
            return response.data;
        } catch (err) {
            set({ isLoading: false });
            toast.error(err.response?.data?.message || 'Error toggling reply like');
            throw err;
        }
    },
}));


