export default function DraftStatus({ status, disabled, onDiscard }) {
    if (!status) return null;
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <p role="status" className={status === "saved" ? "text-[#526c62]" : "text-amber-800"}>
                {status === "saved" ? "Draft saved on this device." : "Could not save the draft on this device."}
            </p>
            <button type="button" disabled={disabled} onClick={onDiscard}
                className="font-semibold text-[#526c62] underline underline-offset-2 hover:text-red-700 disabled:opacity-50">
                Discard draft
            </button>
        </div>
    );
}
