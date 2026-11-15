import { MessageSquare } from "lucide-react";

export default function NoChatSelected() {
    return (
        <div className="max-w-sm p-6 text-center">
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-[#e7f0ec] text-[#346557]"><MessageSquare size={23} aria-hidden="true" /></span>
            <h2 className="font-semibold">Select a conversation</h2>
            <p className="mt-1 text-sm text-[#526c62]">Choose a conversation or use New chat to find someone.</p>
        </div>
    );
}
