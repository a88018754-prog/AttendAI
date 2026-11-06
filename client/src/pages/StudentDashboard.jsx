import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import AttendanceCalendar from "../components/AttendanceCalendar.jsx";

const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ records: [], today: null, todayDate: localToday() });

  useEffect(() => {
    api.get("/attendance/history").then((r) => setData(r.data));
  }, []);

  const count = (s) => data.records.filter((r) => r.status === s).length;

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
          <p className="text-sm text-slate-500">{user.studentId} · {user.course}</p>
          <p className="mt-1 text-sm">
            Today: {data.today ? <StatusBadge status={data.today.status} /> : <span className="text-slate-500">Not marked</span>}
          </p>
        </div>
        {!data.today && <Link to="/student/attendance" className="btn">Mark attendance</Link>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["Present", "Late", "Absent"].map((s) => (
          <div key={s} className="card text-center">
            <p className="text-sm text-slate-500">{s}</p>
            <p className="text-2xl font-bold">{count(s)}</p>
          </div>
        ))}
      </div>

      <AttendanceCalendar records={data.records} todayDate={data.todayDate} />

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">Attendance history</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="py-2">Date</th><th>Status</th><th>Time</th></tr>
          </thead>
          <tbody>
            {data.records.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="py-2">{r.date}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{r.auto ? "—" : new Date(r.markedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
            {!data.records.length && <tr><td colSpan={3} className="py-4 text-center text-slate-500">No records yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
