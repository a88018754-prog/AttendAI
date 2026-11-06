import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar({ darkMode, onToggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="h-[4.5rem] border-b bg-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">A</span>
          <span>Attend<span className="text-indigo-600">AI</span></span>
        </Link>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span>{user.name} <span className="text-slate-400">({user.role})</span></span>
            <button className="btn-outline" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
          {!user && (
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/login" className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 transition hover:bg-slate-100">Sign in</Link>
              <Link to="/register" className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">Get started</Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
