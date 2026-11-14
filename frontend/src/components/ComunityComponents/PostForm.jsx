import { useEffect, useRef, useState } from "react";
import { ImagePlus, PencilLine, Send, X } from "lucide-react";
import { useCommunityStore } from "@/store/communityStore";
import { useAuthStore } from "@/store/authStore";

const PostForm = ({ initialSubject = "" }) => {
    const [newPost, setNewPost] = useState("");
    const { createPost, isCreatingPost } = useCommunityStore();
    const { user } = useAuthStore();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInput = useRef(null);
    const [customSubject, setSubject] = useState(null);
    const subject = customSubject ?? initialSubject;
    const [kind, setKind] = useState("discussion");
    const [sessionAt, setSessionAt] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!image) return;
        const url = URL.createObjectURL(image);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    const handlePost = async (event) => {
        event.preventDefault();
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

    const handleImageChange = (event) => {
        const selectedImage = event.target.files?.[0];
        if (selectedImage) setImage(selectedImage);
        event.target.value = "";
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    return (
        <form aria-labelledby="compose-title" onSubmit={handlePost} className="rounded-xl border border-[#dce7e1] bg-white p-4 sm:p-5">
            <h2 id="compose-title" className="mb-4 flex items-center gap-2 font-semibold text-[#233e35]"><PencilLine size={17} className="text-[#346557]" aria-hidden="true" /> Create a post</h2>
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <label className="flex-1 text-sm font-medium">Subject
                    <input value={subject} maxLength={60} onChange={(event) => setSubject(event.target.value)} placeholder="General" disabled={isCreatingPost} className="mt-1 block w-full rounded-lg border border-[#cbd9d1] px-3 py-2" />
                </label>
                <label className="flex-1 text-sm font-medium">Post type
                    <select value={kind} onChange={(event) => setKind(event.target.value)} disabled={isCreatingPost} className="mt-1 block w-full rounded-lg border border-[#cbd9d1] bg-white px-3 py-2">
                        <option value="discussion">Discussion</option>
                        <option value="question">Ask a question</option>
                        <option value="resource">Share a resource</option>
                        <option value="session">Plan a review session</option>
                    </select>
                </label>
            </div>
            {kind === "session" && <label className="mb-3 block text-sm font-medium">Review date and time (Manila)
                <input type="datetime-local" value={sessionAt} onChange={(event) => setSessionAt(event.target.value)} disabled={isCreatingPost} className="mt-1 block max-w-full rounded-lg border border-[#cbd9d1] px-3 py-2" />
            </label>}
            {formError && <p role="alert" className="mb-3 text-sm text-red-700">{formError}</p>}
            <textarea
                className="block w-full resize-y rounded-lg border border-[#cbd9d1] bg-[#f8faf9] px-3 py-3 text-sm leading-relaxed focus-visible:outline-[#346557]"
                rows="3"
                aria-label="Post details"
                placeholder={kind === "session" ? "Add a topic and meeting details" : "What would you like to share?"}
                disabled={isCreatingPost}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
            />

            {/* Image Preview */}
            {image && imagePreview && (
                <div className="relative mt-3 overflow-hidden rounded-lg border border-[#dce7e1] bg-[#f4f8f6]">
                    <img
                        src={imagePreview}
                        alt="Attachment preview"
                        className="max-h-64 w-full object-contain"
                    />
                    <button
                        type="button" onClick={removeImage} disabled={isCreatingPost} aria-label="Remove image"
                        className="absolute right-2 top-2 rounded-lg bg-white p-2 text-[#233e35] shadow-sm"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf2ef] pt-3">
                <div className="flex min-w-0 items-center gap-2">
                    <button type="button" disabled={isCreatingPost} onClick={() => fileInput.current?.click()} className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#346557] hover:bg-[#e7f0ec]">
                        <ImagePlus size={17} aria-hidden="true" /> {image ? "Replace image" : "Attach image"}
                    </button>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    {image && (
                        <span className="truncate text-xs text-[#526c62]">
                            {image.name}
                        </span>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isCreatingPost || (!newPost.trim() && !image)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#346557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#284f44] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Send size={15} aria-hidden="true" /> {isCreatingPost ? "Posting…" : "Publish post"}
                </button>
            </div>
        </form>
    );
};

export default PostForm;
