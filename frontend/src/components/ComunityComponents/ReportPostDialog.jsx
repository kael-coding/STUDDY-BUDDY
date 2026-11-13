import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { submitPostReport } from "../../lib/communityReports.js";

export default function ReportPostDialog({ postId, onClose, onReported }) {
    const dialog = useRef(null);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        return () => element.close();
    }, []);

    const submit = async (event) => {
        event.preventDefault();
        if (!reason.trim() || submitting) return;
        setSubmitting(true);
        setError("");
        try {
            await submitPostReport(postId, reason.trim());
            toast.success("Report submitted.");
            onReported();
        } catch (requestError) {
            if (requestError.response?.status === 409) {
                toast("You already reported this post.");
                onReported();
                return;
            }
            setError(requestError.response?.data?.message || "Could not submit the report. Try again.");
            setSubmitting(false);
        }
    };

    return (
        <dialog
            ref={dialog}
            aria-labelledby="report-post-title"
            onCancel={(event) => {
                event.preventDefault();
                if (!submitting) onClose();
            }}
            className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/40"
        >
            <form onSubmit={submit} className="space-y-4">
                <h2 id="report-post-title" className="text-lg font-semibold">Report Post</h2>
                <label className="block text-sm font-medium">
                    Why are you reporting this post?
                    <textarea
                        className="mt-2 block w-full rounded-lg border border-gray-300 p-3"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={300}
                        rows={4}
                        required
                        disabled={submitting}
                    />
                </label>
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting || !reason.trim()} className="rounded-lg bg-[#346557] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {submitting ? "Submitting…" : "Submit Report"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
