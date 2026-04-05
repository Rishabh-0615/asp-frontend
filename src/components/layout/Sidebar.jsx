import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserPlus,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileSpreadsheet,
  BookOpen,
  ClipboardList,
  FolderOpen,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const hasAdminAccess = (faculty) => {
  const role = String(faculty?.role || "").toUpperCase();
  return Boolean(
    faculty?.isAdmin === true ||
    faculty?.is_admin === true ||
    faculty?.admin === true ||
    role === "ADMIN" ||
    role === "ROLE_ADMIN"
  );
};

const getNavItems = (isAdmin) => {
  const items = [
    {
      section: "Overview",
      items: [
        { icon: LayoutDashboard, label: "Dashboard",         key: "dashboard" },
      ],
    },
    {
      section: "Faculty",
      items: [
        { icon: FolderOpen,      label: "Create Batch",      key: "create-batch" },
        { icon: BookOpen,        label: "View Batches",      key: "view-batches" },
        { icon: ClipboardList,   label: "Create Assignment", key: "create-assignment" },
        { icon: ClipboardList,   label: "Assignment List",   key: "assignment-list" },
      ],
    },
    {
      section: "System",
      items: [
        { icon: Settings,        label: "Settings",          key: "settings" },
        { icon: User,            label: "Profile",           key: "profile" },
      ],
    },
  ];

  if (isAdmin) {
    items.splice(2, 0, {
      section: "Administrative",
      isAdminSection: true,
      items: [
        { icon: UserCheck,       label: "Pending Approvals", key: "pending-faculties" },
        { icon: Users,           label: "All Faculties",       key: "all-faculties" },
        { icon: UserPlus,        label: "Create Student",    key: "create-student" },
        { icon: FileSpreadsheet, label: "Bulk Upload",       key: "bulk-upload" },
        { icon: GraduationCap,   label: "All Students",      key: "all-students" },
      ],
    });
  }

  return items;
};

const Sidebar = ({ activePage, onNavigate, mobileOpen = false, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);  // ← ADD: Track logout state
  const { faculty, logout } = useAuth();

  const isAdmin = hasAdminAccess(faculty);

  const navItems = getNavItems(isAdmin);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      // Redirect safely after logout
      window.history.replaceState({}, "", "/");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      // Still redirect even if logout fails
      window.history.replaceState({}, "", "/");
      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close menu"
        />
      )}

      <aside className={`
      fixed lg:relative z-40 lg:z-auto inset-y-0 left-0 flex flex-col
      bg-[#1C1F23]
      border-r border-gray-800
      transition-all duration-300 ease-in-out
      ${collapsed ? "w-16" : "w-60"}
      min-h-screen shrink-0
      ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0
    `}>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-6 z-10
          w-6 h-6 rounded-full
          bg-[#1C1F23]
          border border-gray-700
          hover:border-[#00C2FF]
          flex items-center justify-center
          text-gray-400
          hover:text-[#00C2FF]
          shadow-sm transition-all duration-200"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Profile block */}
      <div className={`p-4 border-b border-gray-800
        ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/30 flex items-center justify-center
            text-[#00C2FF] text-xs font-bold">
            {faculty?.name?.[0] || "A"}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/30 flex items-center justify-center
              text-[#00C2FF] text-sm font-bold shrink-0">
              {faculty?.name?.[0] || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-[#F3F4F6] text-sm font-semibold truncate">
                {faculty?.name || "Admin"}
              </p>
              <p className="text-gray-400 text-xs truncate flex items-center gap-1">
                {isAdmin && <ShieldCheck size={11} className="shrink-0 text-[#F59E0B]" />}
                {isAdmin ? "Admin" : "Faculty"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navItems.map(({ section, items, isAdminSection }) => (
          <div key={section}>
            {!collapsed && (
              <p className={`text-xs font-semibold uppercase tracking-widest px-3 mb-1.5 flex items-center gap-1.5
                ${isAdminSection ? "text-[#F59E0B]" : "text-gray-500"}`}>
                {isAdminSection && <ShieldCheck size={11} className="shrink-0" />}
                {section}
              </p>
            )}
            <ul className="space-y-0.5">
              {items.map(({ icon: Icon, label, key }) => {
                const isActive = activePage === key;
                return (
                  <li key={key}>
                    <button
                      onClick={() => {
                        onNavigate(key);
                        onMobileClose?.();
                      }}
                      title={collapsed ? label : undefined}
                      className={`
                        w-full flex items-center gap-3 rounded-lg px-3 py-2.5
                        text-sm font-medium transition-all duration-150
                        ${isActive
                          ? "bg-[#00C2FF] text-[#0E0F11]"
                          : "text-gray-400 hover:border hover:border-[#00C2FF] hover:bg-transparent hover:text-[#F3F4F6]"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
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

      {/* Logout */}
      <div className="p-2 border-t border-gray-800">
        <button
          onClick={async () => {
            onMobileClose?.();
            await handleLogout();
          }}
          disabled={loggingOut}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5
            text-sm font-medium transition-all duration-150
            ${collapsed ? "justify-center" : ""}
            ${loggingOut ? "opacity-50 cursor-not-allowed" : "text-gray-400 hover:border hover:border-[#F87171] hover:bg-transparent hover:text-[#F87171]"}
          `}
        >
          <LogOut size={16} className={`shrink-0 ${loggingOut ? "animate-spin" : ""}`} />
          {!collapsed && <span>{loggingOut ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
