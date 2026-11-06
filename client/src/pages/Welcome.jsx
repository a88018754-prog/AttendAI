import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Welcome({ darkMode, onToggleTheme }) {
  return (
    <div className={`relative flex min-h-screen items-center overflow-hidden px-5 py-20 transition-colors sm:px-10 sm:py-16 lg:px-16 ${darkMode ? "bg-[#111330]" : "bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50"}`}>
      <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} className="absolute right-4 top-4 z-10 sm:right-8 sm:top-8" />
      <section className="relative isolate mx-auto flex w-full max-w-6xl items-center text-white">
        <div className={`pointer-events-none absolute -right-24 -top-36 -z-10 h-96 w-96 rounded-full blur-3xl ${darkMode ? "bg-indigo-500/30" : "bg-indigo-300/40"}`} />
        <div className={`pointer-events-none absolute -bottom-48 left-1/4 -z-10 h-96 w-96 rounded-full blur-3xl ${darkMode ? "bg-cyan-500/15" : "bg-cyan-300/30"}`} />
        <div className="w-full max-w-5xl">
            <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] sm:mb-4 sm:text-xs ${darkMode ? "text-cyan-200/80" : "text-indigo-600"}`}>
              Attendance, reimagined
            </p>
            <h1 className={`text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl ${darkMode ? "text-white" : "text-slate-900"}`}>
              <span className="block">Show up.</span>
              <span className="block">
                We&apos;ll take it{" "}
                <span className={`inline-block bg-clip-text text-transparent ${darkMode ? "bg-gradient-to-r from-cyan-200 to-indigo-300" : "bg-gradient-to-r from-indigo-600 to-cyan-600"}`}>from here.</span>
              </span>
            </h1>
            <p className={`mt-3 max-w-lg text-sm leading-6 sm:mt-5 sm:text-base sm:leading-7 ${darkMode ? "text-indigo-100/75" : "text-slate-600"}`}>
              Face-powered check-ins and clear attendance records, so campus life keeps moving.
            </p>
            <div className="mt-5 flex flex-col gap-3 min-[420px]:flex-row sm:mt-7">
              <Link to="/register" className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 min-[420px]:w-auto ${darkMode ? "border-white/20 bg-white/[0.06] text-white hover:bg-white/10" : "border-indigo-600 bg-indigo-600 text-white hover:border-indigo-700 hover:bg-indigo-700"}`}>
                Create student account
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/login" className={`inline-flex w-full items-center justify-center rounded-xl border px-6 py-3.5 text-sm font-semibold transition min-[420px]:w-auto ${darkMode ? "border-white/20 bg-white/[0.06] text-white hover:bg-white/10" : "border-indigo-200 bg-white/70 text-indigo-900 hover:bg-white"}`}>
                Sign in
              </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
