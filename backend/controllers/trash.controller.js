import Note from "../models/notes.model.js";
import Schedule from "../models/schedule.model.js";

const models = new Map([["notes", Note], ["tasks", Schedule]]);

export const getTrash = async (req, res, next) => {
    try {
        const filter = { userId: req.userId, deletedAt: { $type: "date" } };
        const fields = "title subject deletedAt isArchived";
        const [notes, tasks] = await Promise.all([
            Note.find(filter).select(fields).sort({ deletedAt: -1 }),
            Schedule.find(filter).select(fields).sort({ deletedAt: -1 }),
        ]);
        res.json({ notes, tasks });
    } catch (error) {
        next(error);
    }
};

export const restoreTrashItem = async (req, res, next) => {
    const { type, id } = req.params;
    const Model = models.get(type);
    if (!Model) return res.status(404).json({ message: "Invalid item type." });

    try {
        const result = await Model.updateOne(
            { _id: id, userId: req.userId, deletedAt: { $type: "date" } },
            { $set: { deletedAt: null } },
        );
        if (!result.matchedCount) return res.status(404).json({ message: "Item not found in Trash." });
        res.json({ message: "Item restored." });
    } catch (error) {
        next(error);
    }
};
