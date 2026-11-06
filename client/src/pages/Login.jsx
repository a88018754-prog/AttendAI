import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api, { errMsg } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      saveSession(data);
      navigate(data.user.role === "admin" ? "/admin" : "/student");
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-indigo-950/10 dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden min-h-[34rem] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-[#111330] p-10 text-white selection:bg-cyan-300/40 selection:text-white lg:flex xl:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-base font-bold ring-1 ring-white/20">A</span>
            <span className="text-xl font-bold tracking-tight">AttendAI</span>
          </Link>
        </div>
        <div className="relative my-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Your campus, in sync</p>
          <h2 className="mt-4 max-w-sm text-4xl font-bold leading-tight">A better way to show up.</h2>
          <p className="mt-4 max-w-sm text-base leading-7 text-white/90">
            Secure face-powered check-ins and clear attendance records, all in one place.
          </p>
        </div>
      </aside>

      <form onSubmit={submit} className="w-full p-5 sm:p-9 lg:p-10 xl:p-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">Welcome back</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to AttendAI</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Enter your details to continue to your account.</p>
          </div>
          <div className="space-y-5">
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>Email address</span>
              <input className="input min-w-0 rounded-xl px-4 py-3 text-base" type="email" name="email" autoComplete="email" placeholder="you@school.edu" aria-label="Email" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>Password</span>
              <input className="input min-w-0 rounded-xl px-4 py-3 text-base" type="password" name="password" autoComplete="current-password" placeholder="Enter your password" aria-label="Password" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
            <button className="btn w-full rounded-xl py-3 text-base shadow-lg shadow-indigo-600/20">Sign in</button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            New student? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200">Create an account</Link>
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M7 10V7a5 5 0 0 1 10 0v3m-11 0h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Your account is protected and secure
          </div>
        </div>
      </form>
    </section>
  );
}
