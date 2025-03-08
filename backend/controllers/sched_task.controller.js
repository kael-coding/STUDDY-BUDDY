import { Schedule } from "../models/schedule.model.js";
import moment from "moment-timezone";

export const createTask = async (req, res) => {
    try {
        const { title, description, startDate, dueDate, priority, timeDue } = req.body;

        if (!startDate || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Start Date and Due Date are required."
            });
        }


        const startDateTime = moment.tz(startDate, "Asia/Manila").format("YYYY-MM-DD");
        const dueDateTime = moment.tz(dueDate, "Asia/Manila").format("YYYY-MM-DD");

        console.log("Formatted Start Date:", startDateTime);
        console.log("Formatted Due Date:", dueDateTime);

        if (!moment(startDateTime, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({
                success: false,
                message: "Invalid start date format. Please check the start date provided.",
            });
        }

        if (!moment(dueDateTime, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({
                success: false,
                message: "Invalid due date format. Please check the due date provided.",
            });
        }

        if (moment(startDateTime).isAfter(dueDateTime)) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after due date.",
            });
        }

        const validPriorities = ["low", "medium", "high"];
        const normalizedPriority = (priority && priority.toLowerCase()) || "low";
        if (!validPriorities.includes(normalizedPriority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority value. Valid values are: low, medium, high.",
            });
        }

        // Generate a unique custom ID for the task
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
            title,
            description,
            startDate: startDateTime,
            dueDate: dueDateTime,
            priority: normalizedPriority,
            timeDue: timeDue || "00:00",
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


export const getSTasks = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

        const tasks = await Schedule.find({ userId }).sort({ dueDate: 1 });

        return res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error("Error in getTasks:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
