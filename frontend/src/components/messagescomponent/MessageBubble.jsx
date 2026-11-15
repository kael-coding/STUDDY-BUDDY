import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { formatMessageTime } from "@/lib/utils/formatTime.js";
import MessageActions from "./MessageActions.jsx";

export default function MessageBubble({ message, own }) {
    const [preview, setPreview] = useState(null);
    const dialog = useRef(null);
    useEffect(() => {
        const element = dialog.current;
        if (!element) return;
        element.showModal();
        return () => element.close();
    }, [preview]);

    return (
        <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] sm:max-w-[78%]">
                <div className={`rounded-2xl px-3.5 py-2 text-sm ${own ? "rounded-br-md bg-[#346557] text-white" : "rounded-bl-md border border-[#dce7e1] bg-white"}`}>
                    {!!message.images?.length && <div className="flex flex-wrap gap-2">
                        {message.images.map((url, index) => <button key={index} type="button" className="overflow-hidden rounded-lg" aria-label={`Open attachment ${index + 1}`} onClick={() => setPreview(url)}>
                            <img src={url} alt={`Attachment ${index + 1}`} loading="lazy" className="max-h-48 max-w-full rounded-lg object-contain" />
                        </button>)}
                    </div>}
                    {message.text && <p className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${message.images?.length ? "mt-2" : ""}`}>{message.text}</p>}
                </div>
                <div className={`mt-1 flex items-center gap-1.5 text-[11px] text-[#526c62] ${own ? "justify-end" : ""}`}>
                    {message.editedAt && <span>Edited</span>}
                    {message.createdAt && <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>}
                    {own && <MessageActions message={message} />}
                </div>
            </div>
            {preview && <dialog ref={dialog} aria-label="Attachment preview" onCancel={(event) => { event.preventDefault(); setPreview(null); }}
                className="m-auto max-w-[92vw] rounded-xl bg-white p-3 backdrop:bg-black/75">
                <div className="mb-2 flex justify-end">
                    <button type="button" aria-label="Close preview" onClick={() => setPreview(null)} className="rounded-lg p-1.5 hover:bg-[#e7f0ec]"><X size={20} aria-hidden="true" /></button>
                </div>
                <img src={preview} alt="Message attachment" className="max-h-[75dvh] max-w-full object-contain" />
            </dialog>}
        </div>
    );
}
