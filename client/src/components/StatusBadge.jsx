const styles = {
  Present: "bg-green-100 text-green-700",
  Late: "bg-amber-100 text-amber-700",
  Absent: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${styles[status] || "bg-slate-100"}`}>{status}</span>;
}
