import { useState } from "react";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import StudyDialog from "@/components/StudyDialog.jsx";

const actions = {
    trash: { label: "Move to Trash", description: "You can restore it from Trash later.", Icon: Trash2 },
    archive: { label: "Archive", description: "You can unarchive it later.", Icon: Archive },
    unarchive: { label: "Unarchive", description: "It will return to your active list.", Icon: RotateCcw },
    restore: { label: "Restore", description: "It will return to your active list.", Icon: RotateCcw },
    restoreArchive: { label: "Restore to Archive", description: "It will be moved out of Trash and into Archive.", Icon: Archive },
};

export default function ConfirmStudyAction({ action, itemTitle, onConfirm, onClose }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const { label, description, Icon } = actions[action];
    const danger = action === "trash";

    const confirm = async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            await onConfirm();
            onClose();
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message || "Could not move this item. Try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <StudyDialog onClose={onClose} busy={busy} className="w-[min(26rem,calc(100%-1.5rem))]">
            {(titleId) => (
                <form onSubmit={confirm}>
                    <div className="flex items-start gap-3 p-5">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${danger ? "bg-red-50 text-red-700" : "bg-[#e7f0ec] text-[#346557]"}`}>
                            <Icon size={19} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 space-y-1">
                            <h2 id={titleId} className="font-semibold">{label}?</h2>
                            <p className="text-sm font-medium [overflow-wrap:anywhere]">{itemTitle}</p>
                            <p className="text-sm text-[#526c62]">{description}</p>
                            {error && <p role="alert" className="pt-1 text-sm text-red-700">{error}</p>}
                        </div>
                    </div>
                    <footer className="flex flex-wrap justify-end gap-2 border-t border-[#dce7e1] bg-[#f8faf9] p-3 sm:px-5">
                        <button type="button" autoFocus onClick={onClose} disabled={busy}
                            className="rounded-lg border border-[#cbd9d1] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#e7f0ec] disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={busy} className={`rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 ${danger ? "bg-red-700 hover:bg-red-800" : "bg-[#346557] hover:bg-[#294f43]"}`}>
                            {busy ? "Moving…" : label}
                        </button>
                    </footer>
                </form>
            )}
        </StudyDialog>
    );
}
