import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function AdminDialog({ title, children, actions, busy, onClose }) {
    const dialog = useRef(null);
    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        return () => element.close();
    }, []);

    return (
        <dialog ref={dialog} aria-labelledby="admin-dialog-title" className="m-auto max-h-[90dvh] w-[min(36rem,calc(100%-2rem))] overflow-auto rounded-xl border border-[#dce7e1] bg-white p-0 text-[#233e35] shadow-xl backdrop:bg-[#1f3430]/50"
            onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
            <header className="flex items-center justify-between gap-3 border-b border-[#dce7e1] px-5 py-3">
                <h2 id="admin-dialog-title" className="text-lg font-semibold">{title}</h2>
                <button type="button" aria-label="Close dialog" disabled={busy} onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#e7f0ec] disabled:opacity-50"><X size={18} aria-hidden="true" /></button>
            </header>
            <div className="space-y-4 p-5">{children}</div>
            {actions && <footer className="flex flex-wrap justify-end gap-2 border-t border-[#dce7e1] p-4">{actions}</footer>}
        </dialog>
    );
}
