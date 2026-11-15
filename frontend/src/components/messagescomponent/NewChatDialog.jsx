import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance.js";
import { useAuthStore } from "@/store/authStore.js";
import ChatAvatar from "./ChatAvatar.jsx";
import ChatRoleBadge from "./ChatRoleBadge.jsx";

export default function NewChatDialog({ adminOnly, onSelect, onClose }) {
    const dialog = useRef(null);
    const onlineUsers = useAuthStore((state) => state.onlineUsers);
    const [search, setSearch] = useState("");
    const [result, setResult] = useState(null);
    const [retry, setRetry] = useState(0);
    const [page, setPage] = useState(1);
    const query = search.trim();
    const current = result?.query === query && result.page === page ? result : null;

    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        return () => element.close();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const { data, headers } = await axiosInstance.get("/chat/contacts", {
                    params: { search: query, page, ...(adminOnly && { role: "admin" }) },
                    signal: controller.signal,
                });
                if (!controller.signal.aborted) setResult({ query, page, contacts: data, hasMore: headers["x-has-more"] === "true" });
            } catch {
                if (!controller.signal.aborted) setResult({ query, page, error: "Could not load contacts. Try again." });
            }
        }, query ? 220 : 0);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [query, page, adminOnly, retry]);

    const changePage = (nextPage) => {
        setResult(null);
        setPage(nextPage);
    };

    return (
        <dialog ref={dialog} aria-labelledby="new-chat-title"
            onCancel={(event) => { event.preventDefault(); onClose(); }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
            className="m-auto max-h-[85dvh] w-[min(28rem,calc(100%-2rem))] overflow-auto rounded-xl border border-[#dce7e1] bg-white p-0 text-[#233e35] shadow-lg backdrop:bg-[#1f3430]/55">
            <div className="p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 id="new-chat-title" className="font-semibold">{adminOnly ? "Chat with an admin" : "New chat"}</h2>
                    <button type="button" onClick={onClose} aria-label="Close new chat" className="rounded-lg p-1.5 hover:bg-[#e7f0ec]"><X size={19} aria-hidden="true" /></button>
                </div>
                <label className="flex items-center gap-2 rounded-lg border border-[#cbd9d1] px-3 py-2 focus-within:border-[#346557]">
                    <Search size={16} className="shrink-0 text-[#526c62]" aria-hidden="true" />
                    <input autoFocus type="search" maxLength={60} aria-label="Search contacts" placeholder={adminOnly ? "Search admins" : "Search by username"} value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            if (event.target.value.trim() !== query) changePage(1);
                        }}
                        className="w-full min-w-0 text-sm outline-none" />
                </label>
                {!current && <p role="status" className="mt-3 text-sm text-[#526c62]">Loading contacts…</p>}
                {current?.error && <p role="alert" className="mt-3 text-sm text-red-700">{current.error}
                    <button type="button" onClick={() => { setResult(null); setRetry((value) => value + 1); }} className="ml-1 underline">Retry</button>
                </p>}
                {current?.contacts?.length === 0 && <p className="mt-3 text-sm text-[#526c62]">{adminOnly ? "No admins found." : "No matching contacts."}</p>}
                {!!current?.contacts?.length && <ul key={page} className="mt-3 max-h-72 divide-y divide-[#edf2ef] overflow-y-auto">
                    {current.contacts.map((contact) => <li key={contact._id}>
                        <button type="button" onClick={() => onSelect(contact)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#e7f0ec]">
                            <ChatAvatar user={contact} online={onlineUsers.includes(contact._id)} />
                            <span className="min-w-0 truncate text-sm font-semibold">{contact.userName}</span>
                            <ChatRoleBadge role={contact.role} />
                        </button>
                    </li>)}
                </ul>}
                {(page > 1 || current?.hasMore) && (
                    <nav aria-label="Contact pages" className="mt-3 flex items-center justify-end gap-3 border-t border-[#edf2ef] pt-3 text-sm">
                        <button type="button" disabled={page === 1} onClick={() => changePage(page - 1)} className="font-medium text-[#346557] disabled:opacity-50">Previous</button>
                        <span className="text-xs text-[#526c62]">Page {page}</span>
                        <button type="button" disabled={!current?.hasMore} onClick={() => changePage(page + 1)} className="font-medium text-[#346557] disabled:opacity-50">Next</button>
                    </nav>
                )}
            </div>
        </dialog>
    );
}
