export default function ThemeToggle({ darkMode, onToggle, className = "" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={darkMode}
      aria-label="Dark mode"
      title={`Switch to ${darkMode ? "light" : "dark"} mode`}
      onClick={onToggle}
      className={`inline-flex h-10 w-[4.5rem] items-center justify-start rounded-full border border-slate-300 bg-white p-1 shadow-md shadow-slate-900/10 transition hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-offset-slate-900 ${className}`}
    >
      <span className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-transform ${darkMode ? "translate-x-7 bg-indigo-600 text-white" : "translate-x-0 bg-slate-100 text-amber-600"}`}>
        {darkMode ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
