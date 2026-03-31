import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useStudentAuth } from "./context/StudentAuthContext";
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";

/* ── Fullscreen loader ── */
const AppLoader = () => (
  <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
    {/* Spinner */}
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-gray-800" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00C2FF] animate-spin" />
    </div>
    <p className="text-sm text-gray-500 tracking-wide">Loading...</p>
  </div>
);

const App = () => {
  const { isLoggedIn: isFacultyLoggedIn, initializing } = useAuth();
  const { isLoggedIn: isStudentLoggedIn, loading: studentLoading } = useStudentAuth();
  const [page, setPage] = useState("auth");

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/student")) {
      if (path === "/student/login") {
        setPage("student-login");
      } else if (path === "/student/dashboard") {
        setPage("student-dashboard");
      }
    } else {
      setPage("auth");
    }
  }, []);

  const isStudentRoute = page === "student-login" || page === "student-dashboard";

  // Wait for auth contexts before deciding which screen to render.
  if (initializing || (isStudentRoute && studentLoading)) {
    return <AppLoader />;
  }

  // Student routes must stay in student flow even if faculty session exists.
  if (isStudentRoute) {
    if (isStudentLoggedIn()) {
      if (window.location.pathname !== "/student/dashboard") {
        window.history.replaceState({}, "", "/student/dashboard");
      }
      return <StudentDashboard />;
    }

    return (
      <StudentLogin
        onLoginSuccess={() => {
          setPage("student-dashboard");
          window.history.replaceState({}, "", "/student/dashboard");
        }}
      />
    );
  }

  // Faculty logged in → dashboard
  if (isFacultyLoggedIn()) {
    return <DashboardPage />;
  }

  // Faculty auth
  return <AuthPage onLoginSuccess={() => {}} />;
};

export default App;