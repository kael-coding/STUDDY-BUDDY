import { ImageOff } from "lucide-react";
import { useState } from "react";

export default function PostImage({ src }) {
    const [failed, setFailed] = useState(false);
    if (failed) {
        return <p className="mt-3 flex items-center gap-2 rounded-lg bg-[#f4f8f6] p-3 text-sm text-[#526c62]"><ImageOff size={16} aria-hidden="true" /> Image unavailable</p>;
    }
    return (
        <a href={src} target="_blank" rel="noopener noreferrer" aria-label="Open attached image in a new tab"
            className="mt-3 block overflow-hidden rounded-lg border border-[#dce7e1] bg-[#f4f8f6]">
            <img src={src} alt="Post attachment" loading="lazy" onError={() => setFailed(true)} className="max-h-96 w-full object-contain" />
        </a>
    );
}
