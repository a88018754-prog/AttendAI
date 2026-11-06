// All attendance rules are evaluated in the institute's timezone,
// independent of where the server runs.
const TZ = () => process.env.TZ_NAME || "Asia/Kolkata";

function parts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ(),
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: (Number(p.hour) % 24) * 60 + Number(p.minute) };
}

export const todayKey = (d) => parts(d).date;

export const DEFAULT_ATTENDANCE_TIMES = {
  presentUntil: "09:30",
  lateUntil: "10:00",
  absentAt: "10:30",
};

/** Returns "Present", "Late" or null (closed) for the given moment. */
export function statusForTime(d = new Date(), settings = DEFAULT_ATTENDANCE_TIMES) {
  const { minutes } = parts(d);
  const presentUntil = toMinutes(settings.presentUntil);
  const lateUntil = toMinutes(settings.lateUntil);
  if (minutes < presentUntil) return "Present";
  if (minutes < lateUntil) return "Late";
  return null;
}

export function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isValidTime(time) {
  return typeof time === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
}
