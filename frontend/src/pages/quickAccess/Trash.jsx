import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const api = "/api/archieve/trash";

export default function Trash() {
    const [items, setItems] = useState(null);
    const [error, setError] = useState("");
    const [restoring, setRestoring] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        axios.get(api, { withCredentials: true, signal: controller.signal })
            .then(({ data }) => setItems(data))
            .catch(() => {
                if (!controller.signal.aborted) setError("Could not load Trash.");
            });
        return () => controller.abort();
    }, []);

    const restore = async (type, item) => {
        const key = `${type}/${item._id}`;
        setRestoring(key);
        try {
            await axios.put(`${api}/${type}/${encodeURIComponent(item._id)}/restore`, {}, { withCredentials: true });
            setItems((current) => ({ ...current, [type]: current[type].filter(({ _id }) => _id !== item._id) }));
            toast.success(item.isArchived ? "Restored to Archive." : "Item restored.");
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Could not restore this item. Try again.");
        } finally {
            setRestoring(null);
        }
    };

    return (
        <main className="mx-auto max-w-4xl p-5 text-gray-900">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Trash</h1>
                <Link to="/archive" className="text-sm font-semibold text-[#346557] underline">Open Archive</Link>
            </div>
            {error && <p role="alert" className="text-red-700">{error}</p>}
            {!items && !error && <p role="status">Loading Trash…</p>}
            {items && (
                <div className="grid gap-4 md:grid-cols-2">
                    {["tasks", "notes"].map((type) => (
                        <section key={type} className="rounded-xl border border-gray-200 bg-white p-4">
                            <h2 className="font-semibold capitalize">{type}</h2>
                            {items[type].length === 0 && <p className="mt-2 text-sm text-gray-600">No {type} in Trash.</p>}
                            <ul className="divide-y divide-gray-100">
                                {items[type].map((item) => (
                                    <li key={item._id} className="flex items-center justify-between gap-3 py-3">
                                        <div className="min-w-0 break-words">
                                            <p>{item.title}</p>
                                            {item.subject && <p className="text-sm text-gray-600">{item.subject}</p>}
                                        </div>
                                        <button type="button" disabled={restoring !== null} onClick={() => restore(type, item)}
                                            aria-label={`Restore ${item.title}`}
                                            className="rounded-lg bg-[#e5f1eb] px-3 py-2 text-sm font-medium text-[#295547] disabled:opacity-60">
                                            {restoring === `${type}/${item._id}` ? "Restoring…" : "Restore"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
}
