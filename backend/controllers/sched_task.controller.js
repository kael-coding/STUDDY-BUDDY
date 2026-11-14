import Note from "../models/notes.model.js";
import mongoose from "mongoose";
import { validSubject } from "../lib/utils/validSubject.js";
import Schedule from "../models/schedule.model.js";
import moment from "moment-timezone";
import { taskDeadline } from "../lib/utils/taskDeadline.js";
import { BADGE_LEVELS } from "../config/badges.config.js";

const canLinkNote = async (noteId, userId) => {
    if (noteId === undefined || noteId === null) return true;
    return typeof noteId === "string" && Boolean(await Note.exists({ _id: noteId, userId, deletedAt: null }));
};

const assessmentTypes = ["task", "quiz", "exam", "assignment"];
const validAssessment = (type, topics) =>
    (type === undefined || assessmentTypes.includes(type)) &&
    (topics === undefined || (Array.isArray(topics) && topics.length <= 40 &&
        topics.every((topic) => typeof topic === "string" && topic.trim().length > 0 && topic.trim().length <= 160)));

export const createTask = async (req, res) => {
    try {
        const { title, description, startDate, dueDate, priority, timeDue, subject, noteId } = req.body;
        const { assessmentType, topics } = req.body;
        if (!validAssessment(assessmentType, topics)) return res.status(400).json({ message: "Invalid assessment type or checklist." });

        if (!validSubject(subject)) return res.status(400).json({ message: "Subject must be text up to 60 characters." });
        if (!await canLinkNote(noteId, req.userId)) return res.status(404).json({ message: "Linked note not found." });

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required."
            });
        }
        if (!startDate || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Start Date and Due Date are required."
            });
        }

        // Use moment to parse and format the start and due dates in the Asia/Manila timezone
        const startDateTime = moment.tz(startDate, "Asia/Manila").format("YYYY-MM-DD");
        const dueDateTime = moment.tz(dueDate, "Asia/Manila").format("YYYY-MM-DD");

        if (!moment(startDateTime, "YYYY-MM-DD", true).isValid() || !moment(dueDateTime, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Please check the start and due date provided.",
            });
        }

        if (moment(startDateTime).isAfter(dueDateTime)) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after due date.",
            });
        }

        const validPriorities = ["low", "medium", "high"];
        const normalizedPriority = (priority && priority.toLowerCase()) || "low"; // default to "low"
        if (!validPriorities.includes(normalizedPriority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority value. Valid values are: low, medium, high.",
            });
        }

        let customId;
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(10000 + Math.random() * 90000);
            customId = `50000${randomNum}`;
            const existingTask = await Schedule.findOne({ _id: customId });
            if (!existingTask) isUnique = true;
        }

        const newTask = new Schedule({
            _id: customId,
            userId: req.userId,
            subject,
            noteId,
            assessmentType,
            topics: topics && [...new Set(topics.map((title) => title.trim()))].map((title) => ({ title })),
            title,
            description,
            startDate: startDateTime,
            dueDate: dueDateTime,
            priority: normalizedPriority,
            timeDue: timeDue || "00:00",
            status: "Pending",
            isCompleted: false,
        });

        await newTask.save();
        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: newTask,
        });
    } catch (error) {
        console.error("Error in createTask:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getTasks = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

        const tasks = await Schedule.find({ userId, isArchived: false, deletedAt: null }).sort({ dueDate: 1 });
        return res.status(200).json({ success: true, tasks });

    } catch (error) {
        console.error("Error in getTasks:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startDate, dueDate, priority, timeDue, status, isCompleted, subject, noteId } = req.body;
        const { assessmentType, topics } = req.body;
        if (!validAssessment(assessmentType, topics)) return res.status(400).json({ message: "Invalid assessment type or checklist." });

        if (!id) {
            return res.status(400).json({ success: false, message: "Task ID is required." });
        }

        const task = await Schedule.findOne({ _id: id, userId: req.userId, deletedAt: null });

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found." });
        }

        if (!validSubject(subject)) return res.status(400).json({ message: "Subject must be text up to 60 characters." });
        if (noteId !== undefined && noteId !== task.noteId) {
            if (!await canLinkNote(noteId, req.userId)) return res.status(404).json({ message: "Linked note not found." });
            task.noteId = noteId;
        }
        if (subject !== undefined) task.subject = subject;
        if (assessmentType !== undefined) task.assessmentType = assessmentType;
        if (topics !== undefined) {
            const previous = new Map(task.topics.map((topic) => [topic.title, topic]));
            task.topics = [...new Set(topics.map((title) => title.trim()))].map((title) => previous.get(title) || { title });
        }

        let resetNotifications = false;

        if (title) task.title = title;
        if (description) task.description = description;

        if (startDate) {
            const newStartDate = moment.tz(startDate, "Asia/Manila").format("YYYY-MM-DD");
            if (!moment(newStartDate, "YYYY-MM-DD", true).isValid()) {
                return res.status(400).json({ success: false, message: "Invalid start date format." });
            }
            if (newStartDate !== moment.utc(task.startDate).format("YYYY-MM-DD")) {
                task.startDate = newStartDate;
            }
        }

        if (dueDate) {
            const newDueDate = moment.tz(dueDate, "Asia/Manila").format("YYYY-MM-DD");
            if (!moment(newDueDate, "YYYY-MM-DD", true).isValid()) {
                return res.status(400).json({ success: false, message: "Invalid due date format." });
            }
            if (newDueDate !== moment.utc(task.dueDate).format("YYYY-MM-DD")) {
                task.dueDate = newDueDate;
                resetNotifications = true;
            }
        }

        if (task.startDate && task.dueDate && moment(task.startDate).isAfter(task.dueDate)) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after the due date.",
            });
        }

        if (timeDue && timeDue !== task.timeDue) {
            task.timeDue = timeDue;
            resetNotifications = true;
        }

        if (priority && priority !== task.priority) {
            const validPriorities = ["low", "medium", "high"];
            const normalizedPriority = priority.toLowerCase();

            if (!validPriorities.includes(normalizedPriority)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid priority value. Valid values are: low, medium, high.",
                });
            }

            task.priority = normalizedPriority;
        }

        if (status && task.status !== "completed" && task.status !== "OverDue") {
            task.status = status;
        }

        if (isCompleted !== undefined) task.isCompleted = isCompleted;

        if (resetNotifications) {
            const notificationFlags = [
                "isNotified",
                "isPastDueNotified",
                "isOneDayBeforeNotified",
                "isOneHourBeforeNotified",
            ];
            for (const flag of notificationFlags) {
                task.set(flag, false);
                // The scheduler can set a flag while this edit is in progress.
                task.markModified(flag);
            }

            if (task.status !== "completed" && !task.isCompleted) {
                task.status = "Pending";
                task.markModified("status");
            }
        }

        if (status === "completed") {
            task.status = "completed";
            task.isCompleted = true;
        } else if (status === "Pending" && isCompleted === false) {
            task.status = "Pending";
            task.isCompleted = false;
        }

        const currentTime = moment();
        const dueDateTime = taskDeadline(task);

        if (task.status !== "completed" && !task.isCompleted && dueDateTime.isBefore(currentTime)) {
            task.status = "OverDue";
        }

        // Save the updated task
        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task,
        });

    } catch (error) {
        console.error("Error in updateTask:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const updateAssessmentTopic = async (req, res, next) => {
    const { id, topicId } = req.params;
    const { done } = req.body || {};
    if (!mongoose.isObjectIdOrHexString(topicId) || typeof done !== "boolean") {
        return res.status(400).json({ message: "Invalid checklist update." });
    }
    try {
        const task = await Schedule.findOneAndUpdate(
            { _id: id, userId: req.userId, deletedAt: null, isArchived: false, "topics._id": topicId },
            { $set: { "topics.$.done": done } },
            { new: true },
        );
        if (!task) return res.status(404).json({ message: "Checklist topic not found." });
        res.json({ task });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Task ID is required." });
    }

    try {
        const task = await Schedule.findOneAndUpdate(
            { _id: id, userId: req.userId, deletedAt: null },
            { $set: { deletedAt: new Date() } },
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Task moved to Trash",
        });

    } catch (error) {
        console.error("Error in deleteTask:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};




