import mongoose from "mongoose";
import StudyGroup from "../models/studyGroup.model.js";
import User from "../models/user.model.js";
import { validSubject } from "../lib/utils/validSubject.js";

const summary = ({ _id, name, subject, description, owner, members }, userId) => ({
    _id, name, subject, description,
    memberCount: members.length,
    isMember: members.includes(userId),
    isOwner: owner === userId,
});

export const requireStudyGroupStudent = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("role isVerified");
        if (user?.role !== "user" || !user.isVerified) {
            return res.status(403).json({ message: "A verified student account is required." });
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const listStudyGroups = async (req, res, next) => {
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 80) : "";
    const page = Number(req.query.page ?? 1);
    const pageSize = 24;
    if (!Number.isSafeInteger(page) || page < 1 || page > Math.floor(Number.MAX_SAFE_INTEGER / pageSize)) {
        return res.status(400).json({ message: "Invalid groups page." });
    }

    const filter = {};
    if (req.query.joined === "true") filter.members = req.userId;
    if (search) {
        const match = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
        filter.$or = [{ name: match }, { subject: match }];
    }

    try {
        const groups = await StudyGroup.find(filter).sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * pageSize).limit(pageSize + 1).lean();
        res.json({ groups: groups.slice(0, pageSize).map((group) => summary(group, req.userId)), hasMore: groups.length > pageSize });
    } catch (error) {
        next(error);
    }
};

export const getStudyGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const group = mongoose.isObjectIdOrHexString(groupId) && await StudyGroup.findById(groupId).lean();
        if (!group) return res.status(404).json({ message: "Study group not found." });
        res.json({ group: summary(group, req.userId) });
    } catch (error) {
        next(error);
    }
};

export const createStudyGroup = async (req, res, next) => {
    const { name, subject, description } = req.body ?? {};
    if (typeof name !== "string" || !name.trim() || name.trim().length > 80 ||
        !validSubject(subject) || !subject?.trim() ||
        typeof description !== "string" || !description.trim() || description.trim().length > 500) {
        return res.status(400).json({ message: "Enter a group name, subject, and description within the listed limits." });
    }
    try {
        const group = await StudyGroup.create({ name, subject, description, owner: req.userId, members: [req.userId] });
        res.status(201).json({ group: summary(group, req.userId) });
    } catch (error) {
        next(error);
    }
};

export const setStudyGroupMembership = async (req, res, next) => {
    const { groupId } = req.params;
    const { joined } = req.body ?? {};
    if (!mongoose.isObjectIdOrHexString(groupId) || typeof joined !== "boolean") {
        return res.status(400).json({ message: "Invalid group or membership action." });
    }
    try {
        const group = await StudyGroup.findOneAndUpdate(
            { _id: groupId, ...(!joined && { owner: { $ne: req.userId } }) },
            joined ? { $addToSet: { members: req.userId } } : { $pull: { members: req.userId } },
            { new: true },
        ).lean();
        if (!group) {
            if (!joined && await StudyGroup.exists({ _id: groupId, owner: req.userId })) {
                return res.status(409).json({ message: "The group creator is always a member." });
            }
            return res.status(404).json({ message: "Study group not found." });
        }
        res.json({ group: summary(group, req.userId) });
    } catch (error) {
        next(error);
    }
};
