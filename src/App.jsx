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
  const { isLoggedIn: isStudentLoggedIn } = useStudentAuth();
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

  // Still checking session cookie → show loader, not auth page
  if (initializing) {
    return <AppLoader />;
  }

  // Faculty logged in → dashboard
  if (isFacultyLoggedIn()) {
    return <DashboardPage />;
  }

  // Student logged in → student dashboard
  if (isStudentLoggedIn() && page === "student-dashboard") {
    return <StudentDashboard />;
  }

  // Student login / dashboard
  if (page === "student-login" || page === "student-dashboard") {
    return (
      <StudentLogin
        onLoginSuccess={() => {
          setPage("student-dashboard");
          window.history.pushState({}, "", "/student/dashboard");
        }}
      />
    );
  }

  // Faculty auth
  return <AuthPage onLoginSuccess={() => {}} />;
};

export default App;