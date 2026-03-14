import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  GraduationCap,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { useAdmin } from "../context/AdminContext";
import { useAuth } from "../context/AuthContext";
import CreateStudent from "./admin/CreateStudent";
import StudentBulkUpload from "./admin/StudentBulkUpload";
import AllFaculties from "./admin/AllFaculties";
import AllStudents from "./admin/AllStudents";
import CreateBatch from "./admin/CreateBatch";
import ViewBatches from "./admin/ViewBatches";

/* ────────────────────────────────────────────── */
/* Stat Card                                      */
/* ────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, highlight }) => (
  <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:bg-[#2A2F36]">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${highlight ? "bg-[#00C2FF]/10 border border-[#00C2FF]/30" : "bg-[#0F1114]"}`}>
        <Icon size={20} className={highlight ? "text-[#00C2FF]" : "text-gray-500"} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#F3F4F6]">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────────── */
/* Pending Faculty View                           */
/* ────────────────────────────────────────────── */
const PendingFacultiesView = () => {
  const { pendingFaculties, getPendingFaculties, approveFaculty, revokeFaculty, loading } = useAdmin();

  useEffect(() => { getPendingFaculties(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-[#F3F4F6]">Pending approvals</h2>
          <p className="text-sm text-gray-500 mt-1">Faculty accounts waiting for review.</p>
        </div>
        <button onClick={getPendingFaculties} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-700 text-gray-400 hover:bg-[#2A2F36] hover:text-[#F3F4F6] transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {pendingFaculties.length === 0 ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
          <CheckCircle size={40} className="text-[#00C2FF] mx-auto mb-4" />
          <p className="text-[#F3F4F6] font-medium">Nothing pending right now.</p>
          <p className="text-sm text-gray-500 mt-2">You're all caught up.</p>
        </div>
      ) : (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-[#0F1114]">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-right px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingFaculties.map((f) => (
                <tr key={f.id} className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#F3F4F6]">{f.name}</td>
                  <td className="px-6 py-4 text-gray-500">{f.email}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => approveFaculty(f.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#00C2FF] text-[#0E0F11] hover:bg-[#0099CC] transition-all">Approve</button>
                    <button onClick={() => revokeFaculty(f.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#F87171] text-[#F87171] hover:bg-[#F87171]/10 transition-all">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────── */
/* Dashboard Home                                 */
/* ────────────────────────────────────────────── */
const DashboardHome = ({ onNavigate }) => {
  const { pendingFaculties, getPendingFaculties } = useAdmin();
  const { faculty } = useAuth();

  useEffect(() => { getPendingFaculties(); }, []);

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-[#F3F4F6]">
          Welcome back, {faculty?.name?.split(" ")[0] || "Admin"}.
        </h2>
        <p className="text-sm text-gray-500 mt-2">Here's a quick overview of what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatCard icon={Clock} label="Pending approvals" value={pendingFaculties.length} highlight={pendingFaculties.length > 0} />
        <StatCard icon={UserCheck} label="Active faculty" value="—" />
        <StatCard icon={GraduationCap} label="Total students" value="—" />
        <StatCard icon={Users} label="All users" value="—" />
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Quick actions</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Review pending faculty", key: "pending-faculties" },
            { label: "Create new student",     key: "create-student" },
            { label: "Bulk upload students",   key: "bulk-upload" },
          ].map((action) => (
            <button
              key={action.key}
              onClick={() => onNavigate(action.key)}
              className="text-left px-6 py-5 rounded-2xl border border-gray-700 bg-[#1C1F23] hover:-translate-y-1 hover:bg-[#2A2F36] hover:border-[#00C2FF]/40 hover:shadow-[0_6px_18px_rgba(0,194,255,0.06)] transition-all duration-200"
            >
              <p className="font-medium text-[#F3F4F6]">{action.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────── */
/* Main Dashboard                                 */
/* ────────────────────────────────────────────── */
const Dashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const { faculty } = useAuth();

  const pageTitles = {
    "dashboard":          "Dashboard",
    "pending-faculties":  "Pending Approvals",
    "all-faculties":      "All Faculties",       // ← added
    "all-students":       "All Students",       // ← added
    "create-batch":       "Create Batch",
    "view-batches":       "View Batches",
    "create-student":     "Create Student",
    "bulk-upload":        "Bulk Upload Students",
  };

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":         return <DashboardHome onNavigate={setActivePage} />;
      case "pending-faculties": return <PendingFacultiesView />;
      case "all-faculties":     return <AllFaculties />;      // ← added
      case "all-students":      return <AllStudents />;       // ← added
      case "create-batch":      return <CreateBatch />;
      case "view-batches":      return <ViewBatches />;
      case "create-student":    return <CreateStudent />;
      case "bulk-upload":       return <StudentBulkUpload />;
      default:                  return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F1114]">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex-1 flex flex-col">
        <header className="h-16 px-8 flex items-center justify-between bg-[#1C1F23] border-b border-gray-800">
          <h1 className="text-sm font-semibold text-[#F3F4F6]">
            {pageTitles[activePage] || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] text-sm font-semibold">
              {faculty?.name?.[0] || "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;