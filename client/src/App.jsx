import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import MarkAttendance from "./pages/MarkAttendance.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StudentDetail from "./pages/StudentDetail.jsx";
import Welcome from "./pages/Welcome.jsx";

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-center">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Home({ darkMode, onToggleTheme }) {
  const { user } = useAuth();
  if (!user) return <Welcome darkMode={darkMode} onToggleTheme={onToggleTheme} />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />;
}

export default function App() {
  const { pathname } = useLocation();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("attendai-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("attendai-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <>
      {pathname !== "/" && <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((dark) => !dark)} />}
      <main className={
        pathname === "/"
          ? "min-h-screen"
          : pathname === "/login" || pathname === "/register"
            ? "flex min-h-[calc(100svh-4.5rem)] w-full items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/50 to-cyan-50/50 p-3 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 sm:p-6"
            : "mx-auto w-full max-w-6xl p-3 sm:p-4"
      }>
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} onToggleTheme={() => setDarkMode((dark) => !dark)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student" element={<Protected role="student"><StudentDashboard /></Protected>} />
          <Route path="/student/attendance" element={<Protected role="student"><MarkAttendance /></Protected>} />
          <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="/admin/students/:id" element={<Protected role="admin"><StudentDetail /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
