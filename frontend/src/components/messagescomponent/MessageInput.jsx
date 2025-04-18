import { useRef, useState } from "react";
import { useChatStore } from '../../store/useChatStore';
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessage, selectedUser } = useChatStore()

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!selectedUser) {
            toast.error("Please select a user to chat with!");
            return;
        }

        if (!text.trim() && !imagePreview) {
            toast.error("Please type a message or add an image.");
            return;
        }

        setIsSending(true);

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            });

            setText("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            const errorMsg = error?.response?.data?.message || "Failed to send message";
            toast.error(errorMsg);
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-4 w-full">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#5C8D7D] flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3 text-white" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2 items-center">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md bg-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#5C8D7D]"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`hidden sm:flex w-9 h-9 ${imagePreview ? "text-[#5C8D7D]" : "text-[#5C8D7D]"} bg-white hover:bg-[#74b09c] flex items-center justify-center`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                </div>

                <button
                    type="submit"
                    className={`btn btn-sm btn-circle w-9 h-9 ${text.trim() || imagePreview ? 'bg-[#5C8D7D] text-white' : 'bg-white text-[#5C8D7D]'} hover:bg-[#74b09c] hover:text-white flex items-center justify-center`}
                    disabled={!text.trim() && !imagePreview || isSending}
                >
                    {isSending ? <span>Sending...</span> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
