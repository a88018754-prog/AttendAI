import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    // Student-only fields
    studentId: { type: String, unique: true, sparse: true, trim: true },
    course: { type: String, trim: true },
    // 128-number face descriptor from face-api.js. Never sent to clients.
    faceDescriptor: { type: [Number], default: undefined, select: false },
    faceRegistered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
