import { useState } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { useCommunityStore } from "@/store/communityStore";
import { useAuthStore } from "@/store/authStore";

const PostForm = ({ initialSubject = "" }) => {
    const [newPost, setNewPost] = useState("");
    const { createPost, isCreatingPost } = useCommunityStore();
    const { user } = useAuthStore();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [customSubject, setSubject] = useState(null);
    const subject = customSubject ?? initialSubject;
    const [kind, setKind] = useState("discussion");
    const [sessionAt, setSessionAt] = useState("");
    const [formError, setFormError] = useState("");

    const handlePost = async () => {
        if (isCreatingPost || (!newPost.trim() && !image)) return;
        if (kind === "session" && (!newPost.trim() || !subject.trim() || !sessionAt)) {
            setFormError("Add a subject, date and time, and details for the review session.");
            return;
        }
        setFormError("");
        try {
            const formData = new FormData();
            formData.append('text', newPost);
            formData.append("subject", subject.trim());
            formData.append("studyKind", kind);
            if (kind === "session") formData.append("sessionAt", sessionAt);
            if (image) {
                formData.append('image', image);
            }

            // Pass required user data
            const userData = {
                _id: user._id,
                userName: user.userName,
                profilePicture: user.profilePicture
            };

            await createPost(formData, userData);  // Pass user data
            setNewPost("");
            setImage(null);
            setImagePreview(null);
            setSessionAt("");
            setKind("discussion");
            setSubject(null);
        } catch (error) {
            setFormError(error.response?.data?.message || "Could not publish this post.");
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
            <div className="mb-3 flex flex-wrap gap-3">
                <label className="flex-1 text-sm font-medium">Subject
                    <input value={subject} maxLength={60} onChange={(event) => setSubject(event.target.value)} placeholder="General if blank" disabled={isCreatingPost} className="mt-1 block w-full rounded border p-2" />
                </label>
                <label className="flex-1 text-sm font-medium">Post type
                    <select value={kind} onChange={(event) => setKind(event.target.value)} disabled={isCreatingPost} className="mt-1 block w-full rounded border p-2">
                        <option value="discussion">Discussion</option>
                        <option value="question">Ask a question</option>
                        <option value="resource">Share a resource</option>
                        <option value="session">Plan a review session</option>
                    </select>
                </label>
            </div>
            {kind === "session" && <label className="mb-3 block text-sm font-medium">Review date and time (Manila)
                <input type="datetime-local" value={sessionAt} onChange={(event) => setSessionAt(event.target.value)} disabled={isCreatingPost} className="mt-1 block rounded border p-2" />
            </label>}
            {formError && <p role="alert" className="mb-3 text-sm text-red-700">{formError}</p>}
            <textarea
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                rows="4"
                aria-label="Post details"
                placeholder={kind === "session" ? "Add a topic and meeting details" : "What would you like to share?"}
                disabled={isCreatingPost}
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
