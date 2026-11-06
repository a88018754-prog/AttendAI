import { Router } from "express";
import net from "node:net";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Setting from "../models/Setting.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { DEFAULT_ATTENDANCE_TIMES, isValidTime, todayKey, toMinutes } from "../utils/time.js";
import { markAbsentees, scheduleAutoAbsent } from "../jobs/autoAbsent.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

// Dashboard counts for a given date (default today)
router.get("/stats", async (req, res) => {
  const date = req.query.date || todayKey();
  const [total, grouped] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Attendance.aggregate([{ $match: { date } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const by = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
  const present = by.Present || 0, late = by.Late || 0;
  // Students without a record yet are counted as absent for display purposes
  res.json({ date, total, present, late, absent: total - present - late });
});

router.get("/students", async (_req, res) => {
  const students = await User.find({ role: "student" }).sort({ name: 1 });
  const counts = await Attendance.aggregate([
    { $group: { _id: { s: "$student", st: "$status" }, n: { $sum: 1 } } },
  ]);
  const map = {};
  counts.forEach(({ _id, n }) => ((map[_id.s] ??= {})[_id.st] = n));
  res.json(students.map((s) => ({
    _id: s._id, name: s.name, email: s.email, studentId: s.studentId, course: s.course,
    faceRegistered: s.faceRegistered, createdAt: s.createdAt,
    summary: { Present: 0, Late: 0, Absent: 0, ...map[s._id] },
  })));
});

router.get("/students/:id/attendance", async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: "student" });
  if (!student) return res.status(404).json({ message: "Student not found" });
  const records = await Attendance.find({ student: student._id }).sort({ date: -1 });
  res.json({ student, records });
});

router.get("/attendance", async (req, res) => {
  const date = req.query.date || todayKey();
  const records = await Attendance.find({ date })
    .populate("student", "name studentId course")
    .sort({ markedAt: -1 });
  res.json(records);
});

// CSV export for a date range
router.get("/export", async (req, res) => {
  const from = req.query.from || todayKey();
  const to = req.query.to || from;
  const records = await Attendance.find({ date: { $gte: from, $lte: to } })
    .populate("student", "name studentId course email")
    .sort({ date: 1 });
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["Date", "Student ID", "Name", "Email", "Course", "Status", "Marked At"]];
  records.forEach((r) => rows.push([
    r.date, r.student?.studentId, r.student?.name, r.student?.email, r.student?.course,
    r.status, r.auto ? "auto" : r.markedAt.toISOString(),
  ]));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="attendance_${from}_to_${to}.csv"`);
  res.send(rows.map((r) => r.map(esc).join(",")).join("\n"));
});

// Allowed network ranges (managed by admin)
router.get("/settings", async (_req, res) => res.json(await Setting.get()));

router.put("/settings", async (req, res) => {
  const ranges = (req.body.allowedIpRanges || []).map((r) => String(r).trim()).filter(Boolean);
  const { presentUntil, lateUntil, absentAt } = req.body;
  const valid = ranges.every((r) => {
    const [ip, bits] = r.split("/");
    if (!net.isIP(ip)) return false;
    return bits === undefined || (Number(bits) >= 0 && Number(bits) <= (net.isIPv4(ip) ? 32 : 128));
  });
  if (!ranges.length || !valid)
    return res.status(400).json({ message: "Enter valid IPs or CIDR ranges, e.g. 192.168.0.0/24" });
  const current = await Setting.get();
  const times = {
    presentUntil: presentUntil ?? current.presentUntil ?? DEFAULT_ATTENDANCE_TIMES.presentUntil,
    lateUntil: lateUntil ?? current.lateUntil ?? DEFAULT_ATTENDANCE_TIMES.lateUntil,
    absentAt: absentAt ?? current.absentAt ?? DEFAULT_ATTENDANCE_TIMES.absentAt,
  };
  if (!Object.values(times).every(isValidTime)
    || toMinutes(times.presentUntil) >= toMinutes(times.lateUntil)
    || toMinutes(times.lateUntil) > toMinutes(times.absentAt)) {
    return res.status(400).json({
      message: "Use valid times in HH:MM format, with Present before Late and auto-absent at or after the Late cutoff.",
    });
  }
  const s = await Setting.findOneAndUpdate(
    { key: "global" },
    { allowedIpRanges: ranges, ...times },
    { new: true, upsert: true, runValidators: true },
  );
  scheduleAutoAbsent(req.app.get("io"), s.absentAt);
  res.json(s);
});

// Manual trigger of the absent job (useful for demos)
router.post("/run-absent-job", async (_req, res) => {
  const count = await markAbsentees(_req.app.get("io"));
  res.json({ message: `${count} student(s) marked absent` });
});

export default router;
