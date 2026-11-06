import cron from "node-cron";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import { todayKey } from "../utils/time.js";

/** Creates an "Absent" record for each student with no record today. */
export async function markAbsentees(io) {
  const date = todayKey();
  const marked = await Attendance.distinct("student", { date });
  const missing = await User.find({ role: "student", _id: { $nin: marked } }).select("_id");
  if (!missing.length) return 0;

  const docs = missing.map((s) => ({ student: s._id, date, status: "Absent", auto: true }));
  // ordered:false -> skip any duplicates created concurrently instead of aborting
  await Attendance.insertMany(docs, { ordered: false }).catch((e) => {
    if (e.code !== 11000) throw e;
  });
  io?.to("admins").emit("attendance:absent-run", { date, count: missing.length });
  console.log(`[cron] ${missing.length} student(s) marked absent for ${date}`);
  return missing.length;
}

let absentTask;

export function scheduleAutoAbsent(io, absentAt = "10:30") {
  absentTask?.stop();
  const [hour, minute] = absentAt.split(":");
  absentTask = cron.schedule(`${Number(minute)} ${Number(hour)} * * *`, () => {
    markAbsentees(io).catch((error) => console.error("[cron] Failed to mark absentees:", error));
  }, {
    timezone: process.env.TZ_NAME || "Asia/Kolkata",
  });
}
