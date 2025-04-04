import { useState } from "react";

const Community = () => {
    const [posts, setPosts] = useState([
        { id: 1, author: "John Doe", content: "Excited for the upcoming science fair! Who else is participating? 🎉", likes: 0 },
        { id: 2, author: "Jane Smith", content: "Check out my latest project on renewable energy! 🌱⚡", image: "https://via.placeholder.com/400", likes: 0 },
    ]);

    const [newPost, setNewPost] = useState("");

    const handlePost = () => {
        if (!newPost.trim()) return;
        const newEntry = { id: Date.now(), author: "You", content: newPost, likes: 0 };
        setPosts([newEntry, ...posts]);
        setNewPost("");
    };

    const likePost = (id) => {
        setPosts(posts.map(post => post.id === id ? { ...post, likes: post.likes + 1 } : post));
    };

    return (
        <div className="p-5 space-y-5">
            {/* Post Input */}
            <div className="bg-white p-5 rounded shadow">
                <textarea
                    className="w-full p-3 border rounded"
                    rows="3"
                    placeholder="What's on your mind?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                ></textarea>
                <div className="flex justify-between items-center mt-3">
                    <button className="text-blue-500">📸 Add Photo</button>
                    <button onClick={handlePost} className="bg-blue-500 text-white px-4 py-2 rounded">Post</button>
                </div>
            </div>

            {/* Posts Feed */}
            {posts.map((post) => (
                <div key={post.id} className="bg-white p-5 rounded shadow">
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-300 p-2 rounded-full">👤</span>
                        <p className="font-semibold">{post.author}</p>
                    </div>
                    <p className="mt-3">{post.content}</p>
                    {post.image && <img src={post.image} alt="Post" className="mt-3 rounded w-full" />}
                    <div className="mt-3 flex justify-between text-gray-500 text-sm">
                        <button onClick={() => likePost(post.id)} className="hover:text-blue-500">👍 {post.likes} Like</button>
                        <button className="hover:text-blue-500">💬 Comment</button>
                        <button className="hover:text-blue-500">🔁 Share</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Community;
