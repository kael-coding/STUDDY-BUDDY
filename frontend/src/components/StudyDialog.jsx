import { useEffect, useId, useRef } from "react";

export default function StudyDialog({ onClose, busy, className = "", children }) {
    const dialog = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        return () => element.close();
    }, []);

    return (
        <dialog ref={dialog} aria-labelledby={titleId}
            onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
            className={`m-auto max-h-[calc(100dvh-1.5rem)] max-w-none overflow-hidden rounded-2xl border border-[#dce7e1] bg-white p-0 text-[#233e35] shadow-xl backdrop:bg-[#17352f]/40 ${className}`}>
            {children(titleId)}
        </dialog>
    );
}
