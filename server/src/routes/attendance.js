import { Router } from "express";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireInstituteNetwork, clientIp } from "../middleware/network.js";
import { todayKey, statusForTime } from "../utils/time.js";
import { euclideanDistance, isValidDescriptor, MATCH_THRESHOLD } from "../utils/face.js";
import Setting from "../models/Setting.js";
import ipRangeCheck from "ip-range-check";

const router = Router();
router.use(requireAuth, requireRole("student"));

// Lets the UI show network status before the camera starts (the real check is on /mark).
router.get("/network-status", async (req, res) => {
  const ip = clientIp(req);
  const settings = await Setting.get();
  const status = statusForTime(new Date(), settings);
  res.json({
    ip,
    allowed: ipRangeCheck(ip, settings.allowedIpRanges),
    attendanceOpen: status !== null,
    status,
    closesAt: settings.lateUntil,
  });
});

router.post("/mark", requireInstituteNetwork, async (req, res) => {
  const date = todayKey();
  if (await Attendance.exists({ student: req.user.id, date }))
    return res.status(409).json({ message: "Attendance already recorded for today" });

  const settings = await Setting.get();
  const status = statusForTime(new Date(), settings);
  if (!status) return res.status(403).json({ message: `Attendance is closed. The admin-configured closing time is ${settings.lateUntil}.` });

  const { faceDescriptor } = req.body;
  if (!isValidDescriptor(faceDescriptor)) return res.status(400).json({ message: "No face detected" });

  const student = await User.findById(req.user.id).select("+faceDescriptor");
  if (!student?.faceRegistered) return res.status(400).json({ message: "Face not registered" });

  const distance = euclideanDistance(student.faceDescriptor, faceDescriptor);
  if (distance > MATCH_THRESHOLD) return res.status(401).json({ message: "Face does not match. Try again." });

  try {
    const record = await Attendance.create({ student: student._id, date, status, ip: req.clientIp });
    // Push to every connected admin dashboard
    req.app.get("io").to("admins").emit("attendance:marked", {
      _id: record._id, date, status, markedAt: record.markedAt,
      student: { _id: student._id, name: student.name, studentId: student.studentId, course: student.course },
    });
    res.status(201).json({ message: "Face detected. Attendance marked successfully.", status });
  } catch (err) {
    // Unique index guards against two simultaneous requests
    if (err.code === 11000) return res.status(409).json({ message: "Attendance already recorded for today" });
    throw err;
  }
});

router.get("/history", async (req, res) => {
  const records = await Attendance.find({ student: req.user.id }).sort({ date: -1 });
  const todayDate = todayKey();
  const today = records.find((r) => r.date === todayDate) || null;
  res.json({ records, today, todayDate });
});

export default router;
