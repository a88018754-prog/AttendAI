import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import FaceCapture from "../components/FaceCapture.jsx";

const fields = [
  ["name", "Full name", "text"],
  ["email", "Email", "email"],
  ["studentId", "Student ID", "text"],
  ["course", "Course / Batch", "text"],
  ["password", "Password (min 6)", "password"],
];

export default function Register() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", studentId: "", course: "", password: "" });
  const [descriptor, setDescriptor] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!descriptor) return setError("Please capture your face first");
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", { ...form, faceDescriptor: descriptor });
      saveSession(data);
      navigate("/student");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-indigo-950/10 dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-[#111330] p-10 text-white selection:bg-cyan-300/40 selection:text-white lg:flex xl:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <Link to="/" className="relative inline-flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-base font-bold ring-1 ring-white/20">A</span>
          <span className="text-xl font-bold tracking-tight">AttendAI</span>
        </Link>
        <div className="relative my-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Get started</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">Make every class count.</h2>
          <p className="mt-4 text-base leading-7 text-white/90">Create your student account and enjoy quick, secure attendance check-ins.</p>
        </div>
        <p className="relative text-xs text-white/75">Your attendance, all in one place.</p>
      </aside>
      <div className="min-w-0 p-5 sm:p-8 lg:p-10">
        <div className="mb-6">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">Student account</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Add your details and register your face for secure check-ins.</p>
        </div>
        <div className="grid min-w-0 gap-5 md:grid-cols-2">
          <div className="min-w-0 space-y-3">
            {fields.map(([key, label, type]) => (
              <label key={key} className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <span>{label}</span>
                <input className="input min-w-0 rounded-xl px-3 py-2.5 text-base" type={type} name={key}
                  autoComplete={key === "password" ? "new-password" : key === "name" ? "name" : key === "email" ? "email" : "off"}
                  aria-label={label} required
                  minLength={key === "password" ? 6 : undefined}
                  value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </label>
            ))}
          </div>
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60 sm:p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Face registration</p>
            <FaceCapture onCapture={setDescriptor} captured={!!descriptor} />
          </div>
        </div>
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
        <button className="btn mt-5 w-full rounded-xl py-3 text-base shadow-lg shadow-indigo-600/20" disabled={busy}>{busy ? "Registering…" : "Create account"}</button>
        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          Already registered? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">Sign in</Link>
        </p>
      </div>
    </form>
  );
}
