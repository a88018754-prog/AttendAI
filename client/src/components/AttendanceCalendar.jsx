import { useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_STYLES = {
  Present: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
  Late: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
  Absent: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200",
};

function shiftMonth(monthKey, amount) {
  const [year, month] = monthKey.split("-").map(Number);
  const shifted = new Date(year, month - 1 + amount, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

export default function AttendanceCalendar({ records, todayDate }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const currentMonth = todayDate.slice(0, 7);
  const month = selectedMonth || currentMonth;
  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = new Date(year, monthNumber - 1, 1);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const recordByDate = new Map(records.map((record) => [record.date, record]));
  const days = [
    ...Array(firstDay.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const monthLabel = firstDay.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <section className="card space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Attendance calendar</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your recorded attendance by date</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-outline inline-flex h-9 w-9 items-center justify-center p-0"
            onClick={() => setSelectedMonth(shiftMonth(month, -1))}
            aria-label="Previous month"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <span className="min-w-32 text-center text-sm font-semibold">{monthLabel}</span>
          <button
            type="button"
            className="btn-outline inline-flex h-9 w-9 items-center justify-center p-0"
            onClick={() => setSelectedMonth(shiftMonth(month, 1))}
            aria-label="Next month"
          >
            <span aria-hidden="true">›</span>
          </button>
          {month !== currentMonth && (
            <button type="button" className="btn-outline hidden px-3 py-1.5 text-xs sm:inline-flex" onClick={() => setSelectedMonth(currentMonth)}>
              Today
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="pb-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="sm:hidden">{day.slice(0, 1)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} aria-hidden="true" />;
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const record = recordByDate.get(date);
          const isToday = date === todayDate;
          const statusStyle = record ? STATUS_STYLES[record.status] : "";
          return (
            <div
              key={date}
              title={record ? `${date}: ${record.status}` : `${date}: No attendance record`}
              aria-label={`${date}${isToday ? ", today" : ""}: ${record?.status || "no record"}`}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border p-1 text-center sm:min-h-[4.5rem] sm:gap-1.5 sm:p-2 ${
                record
                  ? statusStyle
                  : `border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400`
              } ${isToday ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900" : ""}`}
            >
              <span className={`text-xs font-semibold sm:text-sm ${isToday ? "text-indigo-700 dark:text-indigo-300" : ""}`}>{day}</span>
              {record ? (
                <span className="text-[9px] font-semibold leading-none sm:text-[11px]">{record.status}</span>
              ) : (
                <span className="text-[9px] leading-none text-slate-400 dark:text-slate-500">{isToday ? "Today" : "—"}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
        {Object.entries(STATUS_STYLES).map(([status, style]) => (
          <span key={status} className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 ${style}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
          </span>
        ))}
        <span className="inline-flex items-center gap-2 px-1 py-1 text-slate-500 dark:text-slate-400">— No record</span>
      </div>
    </section>
  );
}
