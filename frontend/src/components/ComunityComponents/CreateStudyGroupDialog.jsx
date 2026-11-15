import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

const field = "mt-1 block w-full rounded-lg border border-[#cbd9d1] px-3 py-2";

export default function CreateStudyGroupDialog({ onClose, onCreate }) {
    const dialog = useRef(null);
    const submitting = useRef(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        return () => element.close();
    }, []);

    const submit = async (event) => {
        event.preventDefault();
        if (submitting.current) return;
        const values = new FormData(event.currentTarget);
        const body = Object.fromEntries([...values].map(([name, value]) => [name, value.trim()]));
        if (Object.values(body).some((value) => !value)) {
            setError("Enter a group name, subject, and description.");
            return;
        }
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            const { data } = await axios.post("/api/community/groups", body);
            onCreate(data.group);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not create this group. Try again.");
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    };

    return (
        <dialog ref={dialog} aria-labelledby="create-group-title"
            onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
            className="m-auto max-h-[85dvh] w-[min(30rem,calc(100%-2rem))] rounded-xl border border-[#dce7e1] bg-white p-5 text-[#233e35] shadow-xl backdrop:bg-[#1f3430]/55">
            <div className="mb-4 flex items-center justify-between gap-2">
                <h2 id="create-group-title" className="text-lg font-semibold">Create Study Group</h2>
                <button type="button" disabled={busy} onClick={onClose} aria-label="Close create group" className="rounded-lg p-1.5 hover:bg-[#e7f0ec]"><X size={19} aria-hidden="true" /></button>
            </div>
            <form onSubmit={submit} className="space-y-3">
                <label className="block text-sm font-medium">Group name
                    <input autoFocus name="name" maxLength={80} required disabled={busy} className={field} />
                </label>
                <label className="block text-sm font-medium">Subject
                    <input name="subject" maxLength={60} required disabled={busy} className={field} />
                </label>
                <label className="block text-sm font-medium">Description
                    <textarea name="description" rows={4} maxLength={500} required disabled={busy} className={field} />
                </label>
                <p className="text-xs text-[#526c62]">The group is public to signed-in Study Buddy accounts.</p>
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-[#cbd9d1] px-3 py-2 text-sm font-semibold">Cancel</button>
                    <button type="submit" disabled={busy} className="rounded-lg bg-[#346557] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Creating…" : "Create Group"}</button>
                </div>
            </form>
        </dialog>
    );
}
