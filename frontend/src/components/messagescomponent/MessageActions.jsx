import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Ellipsis, PencilLine, Trash2 } from "lucide-react";
import { useChatStore } from "@/store/useChatStore.js";

const secondary = "rounded-md border border-[#cbd9d1] px-2.5 py-1.5 text-xs font-semibold hover:bg-[#e7f0ec] disabled:opacity-50";

export default function MessageActions({ message }) {
    const trigger = useRef(null);
    const panel = useRef(null);
    const editor = useRef(null);
    const cancel = useRef(null);
    const panelId = useId();
    const { editMessage, deleteMessage } = useChatStore();
    const [step, setStep] = useState("options");
    const [draft, setDraft] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [visible, setVisible] = useState(false);
    const deleting = step === "delete";
    const canSave = Boolean(draft.trim() || message.images?.length) && draft.trim() !== (message.text ?? "");

    const placePanel = useCallback(() => {
        const element = panel.current;
        const anchor = trigger.current;
        if (!element?.matches(":popover-open") || !anchor) return;
        const gap = 6;
        const edge = 8;
        const bounds = anchor.getBoundingClientRect();
        const { clientWidth, clientHeight } = document.documentElement;
        const { offsetWidth, offsetHeight } = element;
        const below = bounds.bottom + gap;
        const above = bounds.top - gap - offsetHeight;
        const top = below + offsetHeight <= clientHeight - edge ? below : above;
        element.style.left = `${Math.max(edge, Math.min(bounds.right - offsetWidth, clientWidth - offsetWidth - edge))}px`;
        element.style.top = `${Math.max(edge, Math.min(top, clientHeight - offsetHeight - edge))}px`;
    }, []);

    useLayoutEffect(() => { placePanel(); }, [visible, step, error, placePanel]);

    useEffect(() => {
        if (!visible) return;
        if (step === "edit") editor.current?.focus({ preventScroll: true });
        if (step === "delete") cancel.current?.focus({ preventScroll: true });
    }, [visible, step]);

    useEffect(() => {
        if (!visible) return;
        const onScroll = (event) => {
            if (!(event.target instanceof Node) || !panel.current?.contains(event.target)) panel.current?.hidePopover();
        };
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", placePanel);
        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", placePanel);
        };
    }, [visible, placePanel]);

    const open = () => {
        if (panel.current.matches(":popover-open")) {
            panel.current.hidePopover();
            return;
        }
        if (busy) return;
        setStep("options");
        setError("");
        setDraft(message.text ?? "");
        panel.current.showPopover();
        placePanel();
    };

    const submit = async (event) => {
        event.preventDefault();
        if (busy || (!deleting && !canSave)) return;
        setBusy(true);
        setError("");
        try {
            if (deleting) await deleteMessage(message);
            else await editMessage(message, draft);
            panel.current?.hidePopover();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not update this message. Try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button ref={trigger} type="button" aria-label="Message options" aria-expanded={visible} aria-controls={panelId} popoverTarget={panelId} onClick={(event) => {
                event.preventDefault();
                open();
            }}
                className="grid size-7 shrink-0 place-items-center rounded-md text-[#526c62] hover:bg-[#e7f0ec]">
                <Ellipsis size={17} aria-hidden="true" />
            </button>
            <div ref={panel} id={panelId} popover="auto" role="group"
                aria-label={deleting ? "Delete message" : step === "edit" ? "Edit message" : "Message options"}
                onToggle={(event) => setVisible(event.newState === "open")}
                className={`fixed inset-auto m-0 max-h-[calc(100dvh-1rem)] overflow-auto rounded-lg border border-[#dce7e1] bg-white text-[#233e35] shadow-md ${step === "options" ? "w-32 p-1" : "w-[min(17rem,calc(100vw-1rem))] p-3"}`}>
                {step === "options" ? (
                    <div className="grid">
                        <button type="button" onClick={() => setStep("edit")} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#e7f0ec]">
                            <PencilLine size={15} aria-hidden="true" /> Edit
                        </button>
                        <button type="button" onClick={() => setStep("delete")} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-700 hover:bg-red-50">
                            <Trash2 size={15} aria-hidden="true" /> Delete
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-2">
                        {deleting ? <p className="text-xs text-[#526c62]">Delete this message for everyone?</p> : (
                            <label className="block text-xs font-medium">Edit message
                                <textarea ref={editor} rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} disabled={busy}
                                    className="mt-1 block w-full resize-none rounded-md border border-[#cbd9d1] px-2 py-1.5 text-sm" />
                            </label>
                        )}
                        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
                        <div className="flex flex-wrap justify-end gap-2">
                            <button ref={cancel} type="button" disabled={busy} className={secondary} onClick={() => panel.current.hidePopover()}>Cancel</button>
                            <button type="submit" disabled={busy || (!deleting && !canSave)}
                                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${deleting ? "bg-red-700 hover:bg-red-800" : "bg-[#346557] hover:bg-[#294f43]"}`}>
                                {busy ? (deleting ? "Deleting…" : "Saving…") : deleting ? "Delete" : "Save"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
