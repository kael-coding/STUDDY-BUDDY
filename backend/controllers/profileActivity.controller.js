import Post from "../models/post.model.js";
import StudyGroup from "../models/studyGroup.model.js";

const pageSize = 12;

export async function getProfileActivity(req, res, next) {
    const { view = "posts" } = req.query;
    const page = Number(req.query.page ?? 1);
    if (!["posts", "groups"].includes(view) || !Number.isSafeInteger(page) || page < 1 || page > Math.floor(Number.MAX_SAFE_INTEGER / pageSize)) {
        return res.status(400).json({ message: "Invalid profile activity view or page." });
    }

    try {
        const offset = (page - 1) * pageSize;
        const sort = { createdAt: -1, _id: -1 };
        if (view === "groups") {
            const groups = await StudyGroup.find({ owner: req.userId }).select("name subject description members")
                .sort(sort).skip(offset).limit(pageSize + 1).lean();
            const items = groups.slice(0, pageSize).map(({ members, ...group }) => ({
                ...group, memberCount: members.length, isMember: members.includes(req.userId),
            }));
            return res.json({ items, hasMore: groups.length > pageSize });
        }

        const posts = await Post.find({ user: req.userId }).select("text image subject studyKind sessionAt createdAt studyGroup")
            .populate("studyGroup", "name").sort(sort).skip(offset).limit(pageSize + 1).lean();
        res.json({ items: posts.slice(0, pageSize), hasMore: posts.length > pageSize });
    } catch (error) {
        next(error);
    }
}
