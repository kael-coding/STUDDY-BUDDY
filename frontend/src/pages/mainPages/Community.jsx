import { useEffect } from "react";
import PostForm from "../../components/ComunityComponents/PostForm.jsx";
import Post from "../../components/ComunityComponents/Post.jsx";
import PostModal from "../../components/ComunityComponents/PostModal.jsx";
import { useCommunityStore } from "../../store/communityStore.js";

const Community = () => {
    const { posts, getPosts, selectedPost, setSelectedPost } = useCommunityStore();

    useEffect(() => {
        getPosts();
    }, [getPosts]);

    const openPost = (postId) => {
        setSelectedPost(posts.find(p => p._id === postId));
    };

    const closePost = () => setSelectedPost(null);

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <PostForm />

            {posts.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                </div>
            ) : (
                posts.map(post => (
                    <Post
                        key={post._id}
                        post={post}
                        openPost={openPost}
                    />
                ))
            )}

            {selectedPost && (
                <PostModal
                    post={selectedPost}
                    closePost={closePost}
                />
            )}
        </div>
    );
};

export default Community;