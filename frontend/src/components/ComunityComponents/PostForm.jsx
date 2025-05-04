import { useState } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { useCommunityStore } from "../../store/communityStore";

const PostForm = () => {
    const [newPost, setNewPost] = useState("");
    const { createPost, isCreatingPost } = useCommunityStore();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handlePost = async () => {
        if (!newPost.trim() && !image) return;
        try {
            const formData = new FormData();
            formData.append('text', newPost);
            if (image) {
                formData.append('image', image);
            }

            await createPost(formData);
            setNewPost("");
            setImage(null);
            setImagePreview(null);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedImage = e.target.files[0];
            setImage(selectedImage);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(selectedImage);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl">
            <textarea
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                rows="4"
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
            />

            {/* Image Preview */}
            {imagePreview && (
                <div className="mt-4 relative">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 rounded-lg object-cover w-full"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                    <label htmlFor="file-input" className="text-[#5C8D7D] hover:text-[#4a7d65] cursor-pointer transition-all">
                        <FaImage className="text-xl" />
                    </label>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    {imagePreview && (
                        <span className="ml-2 text-sm text-gray-500">
                            {image.name}
                        </span>
                    )}
                </div>
                <button
                    onClick={handlePost}
                    disabled={isCreatingPost || (!newPost.trim() && !image)}
                    className="bg-[#5C8D7D] text-white px-5 py-2 rounded-lg hover:bg-[#4a7d65] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreatingPost ? "Posting..." : "Post"}
                </button>
            </div>
        </div>
    );
};

export default PostForm;