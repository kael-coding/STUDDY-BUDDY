import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import StashList from "@/components/quickAccess/StashList.jsx";
import ConfirmStudyAction from "@/components/ConfirmStudyAction.jsx";

const api = "/api/archieve/trash";

export default function Trash() {
    const [items, setItems] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(null);
    const [revision, setRevision] = useState(0);
    const [pending, setPending] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        axios.get(api, { signal: controller.signal })
            .then(({ data }) => { if (!controller.signal.aborted) setItems(data); })
            .catch(() => { if (!controller.signal.aborted) setError("Could not load Trash."); });
        return () => controller.abort();
    }, [revision]);

    const restore = async () => {
        const { type, item, destination } = pending;
        setBusy(item._id);
        try {
            await axios.put(`${api}/${type}/${encodeURIComponent(item._id)}/restore`, { destination });
            setItems((current) => ({ ...current, [type]: current[type].filter(({ _id }) => _id !== item._id) }));
            toast.success(destination === "archive" ? "Restored to Archive." : "Item restored.");
        } finally {
            setBusy(null);
        }
    };

    return <>
        <StashList trash items={items} loading={!items && !error} error={error} busy={busy}
            onRetry={() => { setError(""); setRevision((value) => value + 1); }}
            onRestore={(type, item) => setPending({ type, item, destination: "active" })}
            onRestoreToArchive={(type, item) => setPending({ type, item, destination: "archive" })} />
        {pending && <ConfirmStudyAction action={pending.destination === "archive" ? "restoreArchive" : "restore"} itemTitle={pending.item.title}
            onConfirm={restore} onClose={() => setPending(null)} />}
    </>;
}
