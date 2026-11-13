import mongoose from "mongoose";
import Post from "../models/post.model.js";
import PostReport from "../models/postReport.model.js";
import User from "../models/user.model.js";

export const requireCommunityAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("role isVerified");
        if (user?.role !== "admin" || !user.isVerified) {
            return res.status(403).json({ message: "Community admin access required." });
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const reportPost = async (req, res, next) => {
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (!reason || reason.length > 300) {
        return res.status(400).json({ message: "Enter a reason of up to 300 characters." });
    }

    try {
        const user = await User.findById(req.userId).select("isVerified");
        if (!user?.isVerified) return res.status(403).json({ message: "Verify your account to report a post." });

        const post = await Post.findById(req.params.id).select("user");
        if (!post) return res.status(404).json({ message: "Post not found." });
        if (post.user === req.userId) return res.status(400).json({ message: "You cannot report your own post." });

        await PostReport.init();
        await PostReport.create({ postId: post._id, reporterId: req.userId, reason });
        return res.status(201).json({ message: "Report submitted." });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "You already reported this post." });
        }
        next(error);
    }
};

export const listPostReports = async (req, res, next) => {
    try {
        const reports = await PostReport.find({ status: { $in: ["pending", "removing"] } })
            .sort({ createdAt: 1, _id: 1 })
            .limit(50)
            .populate("postId", "text image")
            .lean();
        res.json({ reports });
    } catch (error) {
        next(error);
    }
};

export const reviewPostReport = async (req, res, next) => {
    const { id } = req.params;
    const decision = req.body?.decision;
    if (!mongoose.isObjectIdOrHexString(id) || !["dismiss", "remove"].includes(decision)) {
        return res.status(400).json({ message: "Invalid report or decision." });
    }

    const remove = decision === "remove";
    const reviewed = { reviewedBy: req.userId, reviewedAt: new Date() };
    try {
        const report = await PostReport.findOneAndUpdate(
            { _id: id, status: { $in: remove ? ["pending", "removing"] : ["pending"] } },
            { $set: { status: remove ? "removing" : "dismissed", ...reviewed } },
            { new: true },
        );
        if (!report) return res.status(409).json({ message: "This report has already been reviewed." });

        if (remove) {
            await Post.updateOne({ _id: report.postId }, { $set: { isRemovedByModerator: true } });
            await PostReport.updateOne({ _id: id, status: "removing" }, { $set: { status: "removed", ...reviewed } });
        }
        res.json({ message: remove ? "Post removed from Community." : "Report dismissed." });
    } catch (error) {
        next(error);
    }
};
