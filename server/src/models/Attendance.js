import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" in institute timezone
    status: { type: String, enum: ["Present", "Late", "Absent"], required: true },
    markedAt: { type: Date, default: Date.now },
    ip: String,
    auto: { type: Boolean, default: false }, // true when set by the absent job
  },
  { timestamps: true }
);

// One record per student per day — the database itself prevents duplicates.
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
