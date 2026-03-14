import { useState } from "react";
import {
  LayoutDashboard,
  Layers3,
  UserCircle2,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { useStudentAuth } from "../../context/StudentAuthContext";

const navItems = [
  { section: "Overview", items: [{ icon: LayoutDashboard, label: "Dashboard", key: "overview" }] },
  {
    section: "Academics",
    items: [
      { icon: Layers3, label: "My Batches", key: "batches" },
      { icon: FileText, label: "Assignments", key: "assignments" },
    ],
  },
  { section: "Account", items: [{ icon: UserCircle2, label: "Profile", key: "profile" }] },
];

const StudentSidebar = ({ activePage, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { student, logout } = useStudentAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/student/login";
  };

  return (
    <aside className={`relative flex flex-col bg-[#1C1F23] border-r border-gray-800 transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-60"} min-h-screen shrink-0`}>
      <button
        onClick={() => setCollapsed((value) => !value)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-[#1C1F23] border border-gray-700 hover:border-[#00C2FF] flex items-center justify-center text-gray-400 hover:text-[#00C2FF] shadow-sm transition-all duration-200"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div className={`p-4 border-b border-gray-800 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] text-xs font-bold">
            {student?.name?.[0] || "S"}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] text-sm font-bold shrink-0">
              {student?.name?.[0] || "S"}
            </div>
            <div className="overflow-hidden">
              <p className="text-[#F3F4F6] text-sm font-semibold truncate">{student?.name || "Student"}</p>
              <p className="text-gray-400 text-xs truncate flex items-center gap-1">
                <GraduationCap size={11} className="shrink-0 text-[#00C2FF]" />
                Student
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1.5 text-gray-500">{section}</p>}
            <ul className="space-y-0.5">
              {items.map(({ icon: Icon, label, key }) => {
                const isActive = activePage === key;
                return (
                  <li key={key}>
                    <button
                      onClick={() => onNavigate(key)}
                      title={collapsed ? label : undefined}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive ? "bg-[#00C2FF] text-[#0E0F11]" : "text-gray-400 hover:border hover:border-[#00C2FF] hover:bg-transparent hover:text-[#F3F4F6]"} ${collapsed ? "justify-center" : ""}`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!collapsed && <span className="truncate">{label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:border hover:border-[#F87171] hover:bg-transparent hover:text-[#F87171] transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;