import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import StashList from "@/components/quickAccess/StashList.jsx";
import ConfirmStudyAction from "@/components/ConfirmStudyAction.jsx";
import { useArchieveStore } from "@/store/archieveStore.js";
import { useNoteStore } from "@/store/noteStore.js";
import { useTaskStore } from "@/store/taskStore.js";

export default function ArchiveMainContent() {
    const { archieve, getArchiveTask, unarchiveNote, setTaskArchived, isLoading, error } = useArchieveStore();
    const deleteTask = useTaskStore((state) => state.deleteTask);
    const deleteNote = useNoteStore((state) => state.deleteNote);
    const [busy, setBusy] = useState(null);
    const [pending, setPending] = useState(null);

    useEffect(() => { getArchiveTask(); }, [getArchiveTask]);

    const move = async () => {
        const { type, item, action } = pending;
        const trash = action === "trash";
        setBusy(item._id);
        try {
            const result = trash
                ? await (type === "tasks" ? deleteTask : deleteNote)(item._id)
                : await (type === "tasks" ? setTaskArchived(item._id, false) : unarchiveNote(item._id));
            if (!result) throw new Error("Could not move this item.");
            toast.success(trash ? "Moved to Trash." : "Item unarchived.");
            await getArchiveTask();
        } finally {
            setBusy(null);
        }
    };

    return <>
        <StashList items={archieve} loading={isLoading} error={error} onRetry={getArchiveTask} busy={busy}
            onRestore={(type, item) => setPending({ type, item, action: "unarchive" })}
            onMoveToTrash={(type, item) => setPending({ type, item, action: "trash" })} />
        {pending && <ConfirmStudyAction action={pending.action} itemTitle={pending.item.title}
            onConfirm={move} onClose={() => setPending(null)} />}
    </>;
}
