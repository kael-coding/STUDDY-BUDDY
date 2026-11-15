import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: { type: String, required: true },
    version: { type: Number, required: true },
    refreshHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

schema.index({ refreshHash: 1 }, { unique: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AuthSession", schema);
