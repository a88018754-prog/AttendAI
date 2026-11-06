import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function StudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/students/${id}/attendance`).then((r) => setData(r.data));
  }, [id]);

  if (!data) return <p>Loading…</p>;
  const { student, records } = data;
  const pct = records.length
    ? Math.round((records.filter((r) => r.status !== "Absent").length / records.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Link to="/admin" className="text-sm text-indigo-600">← Back</Link>
      <div className="card">
        <h1 className="text-xl font-bold">{student.name}</h1>
        <p className="text-sm text-slate-500">{student.studentId} · {student.course} · {student.email}</p>
        <p className="mt-2 text-sm">Attendance rate: <b>{pct}%</b> over {records.length} day(s)</p>
      </div>
      <div className="card">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500"><tr><th className="py-2">Date</th><th>Status</th><th>Time</th><th>IP</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="py-2">{r.date}</td><td><StatusBadge status={r.status} /></td>
                <td>{r.auto ? "auto" : new Date(r.markedAt).toLocaleTimeString()}</td><td>{r.ip || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
