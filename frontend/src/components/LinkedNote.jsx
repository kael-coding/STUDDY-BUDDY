import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function LinkedNote({ noteId, onClose }) {
    const dialog = useRef(null);
    const [note, setNote] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        const controller = new AbortController();
        axios.get(`/api/notes/get-note/${encodeURIComponent(noteId)}`, {
            withCredentials: true,
            signal: controller.signal,
        }).then(({ data }) => setNote(data.note)).catch((requestError) => {
            if (!controller.signal.aborted) {
                setError(requestError.response?.status === 404
                    ? "This note is unavailable. If it’s in Trash, restore it to open it again."
                    : "Could not load the note. Try again.");
            }
        });
        return () => {
            controller.abort();
            element.close();
        };
    }, [noteId]);

    return (
        <dialog ref={dialog} onCancel={(event) => {
            event.preventDefault();
            onClose();
        }} aria-labelledby="linked-note-title"
            className="m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-lg rounded-xl bg-white p-5 text-gray-900 shadow-xl backdrop:bg-black/40">
            <div className="flex items-start justify-between gap-4">
                <h2 id="linked-note-title" className="break-words font-semibold">{note?.title || "Linked Note"}</h2>
                <button type="button" onClick={onClose} className="rounded border px-3 py-1 text-sm">Close</button>
            </div>
            {note?.subject && <p className="mt-1 text-sm text-gray-600">{note.subject}</p>}
            {note && <p className="mt-3 whitespace-pre-wrap break-words">{note.description}</p>}
            {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
            {!note && !error && <p role="status" className="mt-3">Loading note…</p>}
        </dialog>
    );
}
