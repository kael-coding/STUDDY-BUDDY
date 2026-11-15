import User from "../models/user.model.js";

export async function migrateAdminRoles() {
    await User.updateMany({ role: "superadmin" }, { $set: { role: "admin" } });
}
