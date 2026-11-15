import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "@/store/useChatStore.js";

function AttachmentPreview({ file, onRemove, disabled }) {
    const [preview, setPreview] = useState("");
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    return <li className="relative">
        {preview && <img src={preview} alt={file.name} className="size-16 rounded-lg border border-[#dce7e1] object-cover" />}
        <button type="button" aria-label={`Remove ${file.name}`} disabled={disabled} onClick={onRemove}
            className="absolute -right-1 -top-1 rounded-full bg-[#346557] p-1 text-white"><X size={12} aria-hidden="true" /></button>
    </li>;
}

export default function MessageInput() {
    const [text, setText] = useState("");
    const [images, setImages] = useState([]);
    const [busy, setBusy] = useState(false);
    const fileInput = useRef(null);
    const nextAttachment = useRef(0);
    const sendMessage = useChatStore((state) => state.sendMessage);

    const submit = async (event) => {
        event.preventDefault();
        if (busy || (!text.trim() && !images.length)) return;
        const form = new FormData();
        form.append("text", text.trim());
        for (const { file } of images) form.append("images", file);
        setBusy(true);
        try {
            if (await sendMessage(form)) {
                setText("");
                setImages([]);
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="shrink-0 border-t border-[#dce7e1] bg-white p-3">
            {images.length > 0 && <ul className="mb-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto p-1">
                {images.map(({ id, file }) => <AttachmentPreview key={id} file={file} disabled={busy} onRemove={() => setImages((items) => items.filter((item) => item.id !== id))} />)}
            </ul>}
            <div className="flex gap-2">
                <input type="file" multiple accept="image/*" hidden ref={fileInput} onChange={(event) => {
                    const files = Array.from(event.target.files);
                    const valid = files.filter((file) => file.type.startsWith("image/"));
                    if (valid.length !== files.length) toast.error("Choose image files to attach.");
                    const attachments = valid.map((file) => ({ id: nextAttachment.current++, file }));
                    setImages((items) => [...items, ...attachments]);
                    event.target.value = "";
                }} />
                <button type="button" aria-label="Attach images" disabled={busy} onClick={() => fileInput.current?.click()}
                    className="grid size-10 shrink-0 place-items-center rounded-lg text-[#346557] hover:bg-[#e7f0ec]"><ImagePlus size={20} aria-hidden="true" /></button>
                <input aria-label="Write a message" placeholder="Write a message" value={text} disabled={busy} onChange={(event) => setText(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm" />
                <button type="submit" aria-label="Send message" disabled={busy || (!text.trim() && !images.length)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#346557] px-3 text-sm font-semibold text-white hover:bg-[#294f43] disabled:opacity-50">
                    <Send size={16} aria-hidden="true" /><span className="hidden sm:inline">{busy ? "Sending…" : "Send"}</span>
                </button>
            </div>
        </form>
    );
}
