import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import api, { errMsg } from "../lib/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

export default function AdminDashboard() {
  const [date, setDate] = useState(today());
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [live, setLive] = useState(null);

  const load = useCallback(async () => {
    const [s, a, st] = await Promise.all([
      api.get("/admin/stats", { params: { date } }),
      api.get("/admin/attendance", { params: { date } }),
      api.get("/admin/students"),
    ]);
    setStats(s.data);
    setRecords(a.data);
    setStudents(st.data);
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: refresh when any student marks attendance or the absent job runs
  useEffect(() => {
    // const socket = io({ auth: { token: localStorage.getItem("token") } });
    const socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
      auth: { token: localStorage.getItem("token") },
    });
    socket.on("attendance:marked", (rec) => {
      setLive(`${rec.student.name} marked ${rec.status}`);
      load();
    });
    socket.on("attendance:absent-run", ({ count }) => {
      setLive(`${count} student(s) auto-marked absent`);
      load();
    });
    return () => socket.disconnect();
  }, [load]);

  const exportCsv = async () => {
    const res = await api.get("/admin/export", {
      params: { from: date, to: date },
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    Object.assign(document.createElement("a"), {
      href: url,
      download: `attendance_${date}.csv`,
    }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Admin dashboard</h1>
        <div className="flex gap-2">
          <input
            type="date"
            className="input w-auto"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="btn" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {live && (
        <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">
          🔴 Live: {live}
        </p>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Total Students", stats.total],
            ["Present", stats.present],
            ["Late", stats.late],
            ["Absent", stats.absent],
          ].map(([l, v]) => (
            <div key={l} className="card">
              <p className="text-sm text-slate-500">{l}</p>
              <p className="text-3xl font-bold">{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">Attendance on {date}</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Student</th>
              <th>ID</th>
              <th>Course</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="py-2">{r.student?.name}</td>
                <td>{r.student?.studentId}</td>
                <td>{r.student?.course}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td>
                  {r.auto ? "auto" : new Date(r.markedAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-500">
                  No records for this date
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">
          Registered students ({students.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2">Name</th>
              <th>ID</th>
              <th>Course</th>
              <th>Face</th>
              <th>P / L / A</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="py-2">{s.name}</td>
                <td>{s.studentId}</td>
                <td>{s.course}</td>
                <td>
                  {s.faceRegistered ? (
                    <span className="badge bg-green-100 text-green-700">
                      Registered
                    </span>
                  ) : (
                    <span className="badge bg-red-100 text-red-700">
                      Missing
                    </span>
                  )}
                </td>
                <td>
                  {s.summary.Present} / {s.summary.Late} / {s.summary.Absent}
                </td>
                <td>
                  <Link
                    className="text-indigo-600"
                    to={`/admin/students/${s._id}`}
                  >
                    History →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NetworkSettings />
    </div>
  );
}

function NetworkSettings() {
  const [text, setText] = useState("");
  const [times, setTimes] = useState({
    presentUntil: "09:30",
    lateUntil: "10:00",
    absentAt: "10:30",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/admin/settings").then((r) => {
      setText(r.data.allowedIpRanges.join("\n"));
      setTimes({
        presentUntil: r.data.presentUntil,
        lateUntil: r.data.lateUntil,
        absentAt: r.data.absentAt,
      });
    });
  }, []);

  const saveAttendanceTimes = async () => {
    try {
      const { data } = await api.put("/admin/settings", {
        allowedIpRanges: text.split("\n"),
        ...times,
      });
      setTimes({
        presentUntil: data.presentUntil,
        lateUntil: data.lateUntil,
        absentAt: data.absentAt,
      });
      setMsg("Attendance times saved");
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  const saveNetwork = async () => {
    try {
      await api.put("/admin/settings", { allowedIpRanges: text.split("\n") });
      setMsg("Network ranges saved");
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  const runJob = async () =>
    setMsg((await api.post("/admin/run-absent-job")).data.message);

  return (
    <div className="card space-y-3">
      <h2 className="font-semibold">Institute settings</h2>
      <h3 className="text-sm font-medium">Attendance times</h3>
      <p className="text-sm text-slate-500">
        Only the admin controls these times. Students can mark attendance until
        the closing time. Times use the institute timezone.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["presentUntil", "Present until"],
          ["lateUntil", "Attendance closes at"],
          ["absentAt", "Mark absent at"],
        ].map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="block text-slate-600">{label}</span>
            <input
              type="time"
              className="input"
              value={times[key]}
              onChange={(e) => setTimes({ ...times, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <button className="btn" onClick={saveAttendanceTimes}>
        Save attendance times
      </button>
      <h3 className="text-sm font-medium">Institute network</h3>
      <p className="text-sm text-slate-500">
        One IP or CIDR range per line, e.g. <code>192.168.0.0/24</code> (=
        192.168.0.0 – 192.168.0.255).
      </p>
      <textarea
        className="input h-24 font-mono"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={saveNetwork}>
          Save network ranges
        </button>
        <button className="btn-outline" onClick={runJob}>
          Run absent job now
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
