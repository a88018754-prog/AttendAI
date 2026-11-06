import mongoose from "mongoose";

// Single settings document holding institute-wide settings managed by the admin.
const settingSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  // CIDR ranges or single IPs, e.g. ["192.168.0.0/24", "10.0.0.5"]
  allowedIpRanges: { type: [String], default: ["192.168.0.0/24"] },
  presentUntil: { type: String, default: "09:30" },
  lateUntil: { type: String, default: "10:00" },
  absentAt: { type: String, default: "10:30" },
});

settingSchema.statics.get = async function () {
  return (await this.findOne({ key: "global" })) || this.create({ key: "global" });
};

export default mongoose.model("Setting", settingSchema);
