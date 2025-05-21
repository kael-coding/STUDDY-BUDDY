import { useRef, useState } from "react";
import { useChatStore } from '../../store/useChatStore';
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreviews, setImagePreviews] = useState([]);
    const [images, setImages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessage, selectedUser } = useChatStore();

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const validImages = files.filter(file => file.type.startsWith("image/"));

        if (validImages.length !== files.length) {
            toast.error("Some selected files are not images.");
        }

        validImages.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });

        setImages(prev => [...prev, ...validImages]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!selectedUser) {
            toast.error("Please select a user to chat with!");
            return;
        }

        if (!text.trim() && images.length === 0) {
            toast.error("Please type a message or add images.");
            return;
        }

        const formData = new FormData();
        formData.append("text", text.trim());
        images.forEach((img) => formData.append("images", img));

        setIsSending(true);
        try {
            await sendMessage(formData);
            setText("");
            setImagePreviews([]);
            setImages([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-4 w-full">
            {imagePreviews.length > 0 && (
                <div className="mb-3 flex gap-2 flex-wrap">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#5C8D7D] flex items-center justify-center"
                                type="button"
                            >
                                <X className="size-3 text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2 items-center">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md bg-white py-2 px-3"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />
                    <button
                        type="button"
                        className="flex w-9 h-9 text-[#5C8D7D] bg-white hover:bg-[#74b09c] items-center justify-center rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                </div>

                <button
                    type="submit"
                    className={`btn btn-sm btn-circle w-9 h-9 ${text.trim() || images.length ? 'bg-[#5C8D7D] text-white' : 'bg-white text-[#5C8D7D]'} hover:bg-[#74b09c] hover:text-white`}
                    disabled={(!text.trim() && images.length === 0) || isSending}
                >
                    {isSending ? <span>Sending...</span> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
