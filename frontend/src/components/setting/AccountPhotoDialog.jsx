import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { useAuthStore } from "@/store/authStore.js";
import { useUserStore } from "@/store/userStore.js";

export default function AccountPhotoDialog({ user, onClose }) {
    const dialog = useRef(null);
    const updatePhoto = useUserStore((state) => state.updateProfilePicture);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        return () => element.close();
    }, []);

    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const save = async (event) => {
        event.preventDefault();
        if (busy || !file) return;
        setBusy(true);
        setError("");
        try {
            const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
            const encoded = await imageCompression.getDataUrlFromFile(compressed);
            if (useAuthStore.getState().user?._id !== user._id) return;
            const result = await updatePhoto(encoded);
            if (!result.success) {
                setError(result.error);
                return;
            }
            useAuthStore.setState((state) => state.user?._id === user._id
                ? { user: { ...state.user, profilePicture: result.user.profilePicture } } : state);
            toast.success("Profile photo updated.");
            onClose();
        } catch {
            setError("Could not process or save this image.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <dialog ref={dialog} aria-labelledby="photo-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
            className="m-auto max-h-[85dvh] w-[min(28rem,calc(100%-2rem))] rounded-xl border border-[#dce7e1] bg-white p-5 shadow-xl backdrop:bg-[#1f3430]/55">
            <div className="mb-4 flex items-center justify-between">
                <h2 id="photo-title" className="font-semibold">Edit Profile Photo</h2>
                <button type="button" onClick={onClose} disabled={busy} aria-label="Close photo editor" className="rounded-lg p-1.5 hover:bg-[#e7f0ec]"><X size={19} aria-hidden="true" /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
                {(file ? preview : user.profilePicture) && <img alt="Profile photo preview" src={file ? preview : user.profilePicture}
                    className="mx-auto size-24 rounded-full object-cover" />}
                <label className="block text-sm font-medium">Choose an image
                    <input type="file" accept="image/*" disabled={busy} className="mt-2 block w-full text-sm" onChange={(event) => {
                        const selected = event.target.files?.[0];
                        if (!selected) return;
                        setFile(null);
                        setPreview("");
                        if (!selected.type.startsWith("image/") || selected.size > 5 * 1024 * 1024) {
                            setError("Choose an image up to 5 MB.");
                        } else {
                            setFile(selected);
                            setError("");
                        }
                        event.target.value = "";
                    }} />
                </label>
                {file && <p className="text-xs text-[#526c62] [overflow-wrap:anywhere]">{file.name}</p>}
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold">Cancel</button>
                    <button type="submit" disabled={!file || busy} className="rounded-lg bg-[#346557] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save Photo"}</button>
                </div>
            </form>
        </dialog>
    );
}
