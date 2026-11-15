import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: { type: String, required: true },
    earned: { type: [String], default: [] },
});

export default mongoose.model("StudentAchievement", schema);
