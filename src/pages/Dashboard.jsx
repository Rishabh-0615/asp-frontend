import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  GraduationCap,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  Menu,
  Sparkles,
  Send,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { useAdmin } from "../context/AdminContext";
import { useAuth } from "../context/AuthContext";
import { useAssignment } from "../context/AssignmentContext";
import CreateStudent from "./admin/CreateStudent";
import StudentBulkUpload from "./admin/StudentBulkUpload";
import AllFaculties from "./admin/AllFaculties";
import AllStudents from "./admin/AllStudents";
import CreateBatch from "./admin/CreateBatch";
import ViewBatches from "./admin/ViewBatches";
import CreateAssignment from "./admin/CreateAssignment";
import AssignmentList from "./admin/AssignmentList";
import AssignmentAssessment from "./admin/AssignmentAssessment";
import SettingsManagement from "./admin/SettingsManagement";
import BatchDetails from "./admin/BatchDetails";

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

const FACULTY_PAGES = new Set([
  "dashboard",
  "create-batch",
  "view-batches",
  "batch-details",
  "create-assignment",
  "assignment-list",
  "assignment-assessment",
  "settings",
]);

const ADMIN_ONLY_PAGES = new Set([
  "pending-faculties",
  "all-faculties",
  "all-students",
  "create-student",
  "bulk-upload",
]);

const dayStart = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dayEnd = (value) => {
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
};

/* ────────────────────────────────────────────── */
/* Stat Card                                      */
/* ────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, highlight, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left bg-[#1C1F23] border border-gray-700 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:bg-[#2A2F36]"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${highlight ? "bg-[#00C2FF]/10 border border-[#00C2FF]/30" : "bg-[#0F1114]"}`}>
        <Icon size={20} className={highlight ? "text-[#00C2FF]" : "text-gray-500"} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#F3F4F6]">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </button>
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
        <button onClick={getPendingFaculties} className="ui-btn ui-btn-secondary">
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
        <>
          <div className="hidden md:block bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
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

          <div className="md:hidden space-y-3 pb-20">
            {pendingFaculties.map((f) => (
              <div key={f.id} className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-4">
                <p className="text-[#F3F4F6] font-medium text-sm">{f.name}</p>
                <p className="text-xs text-gray-400 mt-1 break-all">{f.email}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => approveFaculty(f.id)} className="min-h-10 px-3 py-2 text-xs font-medium rounded-lg bg-[#00C2FF] text-[#0E0F11]">Approve</button>
                  <button onClick={() => revokeFaculty(f.id)} className="min-h-10 px-3 py-2 text-xs font-medium rounded-lg border border-[#F87171] text-[#F87171]">Reject</button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-[#0F1114]/95 backdrop-blur px-4 py-3">
            <button
              type="button"
              onClick={getPendingFaculties}
              className="w-full min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh pending list
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────── */
/* Dashboard Home                                 */
/* ────────────────────────────────────────────── */
const DashboardHome = ({ onNavigate, isAdmin }) => {
  const { pendingFaculties, getPendingFaculties, getAllFaculties, getAllStudents } = useAdmin();
  const { faculty } = useAuth();
  const { getFacultyAssignments, getAssignmentAssessment } = useAssignment();
  const [adminDashboardMode, setAdminDashboardMode] = useState("admin");
  const [stats, setStats] = useState({ activeFaculty: 0, totalStudents: 0, totalUsers: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [facultyCardsLoading, setFacultyCardsLoading] = useState(false);
  const [facultyStats, setFacultyStats] = useState({
    dueToday: 0,
    overdue: 0,
    lowSubmissionAssignments: 0,
    highAiSuspicionAssignments: 0,
    unreviewedSubmissions: 0,
  });

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadOverview = async () => {
      setStatsLoading(true);
      try {
        const [pendingResult, faculties, students] = await Promise.all([
          getPendingFaculties(),
          getAllFaculties(),
          getAllStudents(),
        ]);

        const pendingCount = pendingResult?.data?.length || 0;
        const activeFacultyCount = (faculties || []).filter((f) => f.status === "ACTIVE").length;
        const totalStudentsCount = (students || []).length;

        setStats({
          activeFaculty: activeFacultyCount,
          totalStudents: totalStudentsCount,
          totalUsers: activeFacultyCount + pendingCount + totalStudentsCount,
        });
      } catch (_) {
        setStats((prev) => prev);
      } finally {
        setStatsLoading(false);
      }
    };

    loadOverview();
  }, [isAdmin]);

  useEffect(() => {
    let disposed = false;

    const getAssessmentInsights = async (assignments) => {
      const needsAssessment = assignments.filter((row) => (row?.submittedCount ?? 0) > 0);

      const settled = await Promise.allSettled(
        needsAssessment.map((row) =>
          getAssignmentAssessment(row.assignmentId, { backgroundRefresh: true })
            .then((assessment) => ({
              assignmentId: row.assignmentId,
              unreviewedCount:
                (assessment?.students || []).filter(
                  (student) => student?.submitted && (student?.aiGeneratedPercent === null || student?.aiGeneratedPercent === undefined)
                ).length,
              hasHighAiSuspicion: (assessment?.students || []).some(
                (student) => student?.submitted && Number(student?.aiGeneratedPercent ?? 0) >= 70
              ),
            }))
        )
      );

      return settled.reduce(
        (acc, item) => {
          if (item.status !== "fulfilled") {
            return acc;
          }

          return {
            highAiAssignments: acc.highAiAssignments + (item.value?.hasHighAiSuspicion ? 1 : 0),
            unreviewedSubmissions: acc.unreviewedSubmissions + (item.value?.unreviewedCount || 0),
          };
        },
        { highAiAssignments: 0, unreviewedSubmissions: 0 }
      );
    };

    const calculateFacultyOverview = async (showLoader, assignmentsOverride = null) => {
      if (showLoader) {
        setFacultyCardsLoading(true);
      }

      try {
        const assignments = assignmentsOverride || (await getFacultyAssignments(undefined, {
          backgroundRefresh: true,
          onBackgroundData: (freshAssignments) => {
            if (disposed) {
              return;
            }
            calculateFacultyOverview(false, freshAssignments || []);
          },
        }));

        const now = new Date();
        const todayStart = dayStart(now);
        const todayEnd = dayEnd(now);

        const dueToday = assignments.filter((row) => {
          if (!row?.deadline) {
            return false;
          }
          const deadline = new Date(row.deadline);
          return deadline >= todayStart && deadline <= todayEnd;
        }).length;

        const overdue = assignments.filter((row) => {
          if (!row?.deadline) {
            return false;
          }
          return new Date(row.deadline) < now && row.isOpen === false;
        }).length;

        const lowSubmissionAssignments = assignments.filter((row) => {
          const totalStudents = Number(row?.totalStudents ?? 0);
          if (totalStudents <= 0) {
            return false;
          }
          const submitted = Number(row?.submittedCount ?? 0);
          return submitted / totalStudents < 0.4;
        }).length;

        const assessmentInsights = await getAssessmentInsights(assignments);

        if (!disposed) {
          setFacultyStats({
            dueToday,
            overdue,
            lowSubmissionAssignments,
            highAiSuspicionAssignments: assessmentInsights.highAiAssignments,
            unreviewedSubmissions: assessmentInsights.unreviewedSubmissions,
          });
        }
      } catch (_) {
        if (!disposed) {
          setFacultyStats((prev) => prev);
        }
      } finally {
        if (!disposed && showLoader) {
          setFacultyCardsLoading(false);
        }
      }
    };

    calculateFacultyOverview(true);

    return () => {
      disposed = true;
    };
  }, [getAssignmentAssessment, getFacultyAssignments]);

  const adminActions = [
    { label: "Review pending faculty", key: "pending-faculties" },
    { label: "Create new student", key: "create-student" },
    { label: "Bulk upload students", key: "bulk-upload" },
  ];

  const facultyActions = [
    { label: "Create new batch", key: "create-batch" },
    { label: "View batches", key: "view-batches" },
    { label: "Create assignment", key: "create-assignment" },
    { label: "Assignment list", key: "assignment-list" },
  ];

  const showAdminDashboard = isAdmin && adminDashboardMode === "admin";
  const showFacultyDashboard = !isAdmin || adminDashboardMode === "faculty";

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-[#F3F4F6]">
          Welcome back, {faculty?.name?.split(" ")[0] || "Admin"}.
        </h2>
        <p className="text-sm text-gray-500 mt-2">Here's a quick overview of what's happening.</p>

        {isAdmin && (
          <div className="mt-5 inline-flex rounded-xl border border-gray-700 bg-[#1C1F23] p-1">
            <button
              type="button"
              onClick={() => setAdminDashboardMode("admin")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${adminDashboardMode === "admin" ? "bg-[#00C2FF] text-[#0E0F11]" : "text-gray-400 hover:text-[#F3F4F6]"}`}
            >
              Admin Dashboard
            </button>
            <button
              type="button"
              onClick={() => setAdminDashboardMode("faculty")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${adminDashboardMode === "faculty" ? "bg-[#00C2FF] text-[#0E0F11]" : "text-gray-400 hover:text-[#F3F4F6]"}`}
            >
              Faculty Dashboard
            </button>
          </div>
        )}
      </div>

      {showAdminDashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <StatCard icon={Clock} label="Pending approvals" value={pendingFaculties.length} highlight={pendingFaculties.length > 0} />
          <StatCard icon={UserCheck} label="Active faculty" value={statsLoading ? "..." : stats.activeFaculty} />
          <StatCard icon={GraduationCap} label="Total students" value={statsLoading ? "..." : stats.totalStudents} />
          <StatCard icon={Users} label="All users" value={statsLoading ? "..." : stats.totalUsers} />
        </div>
      )}

      {showFacultyDashboard && <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500">
              {isAdmin ? "Faculty Command Center (Admin View)" : "Faculty Command Center"}
            </h3>
            <button
              type="button"
              onClick={() => onNavigate({ page: "assignment-list", filter: "all" })}
              className="text-xs text-[#9fdaed] hover:text-[#F3F4F6] transition-colors"
            >
              View all assignments
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {facultyCardsLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 w-3/4 bg-gray-700 rounded mb-3" />
                  <div className="h-8 w-16 bg-gray-700 rounded" />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  icon={Clock}
                  label="Assignments Due Today"
                  value={facultyStats.dueToday}
                  highlight={facultyStats.dueToday > 0}
                  onClick={() => onNavigate({ page: "assignment-list", filter: "due-today" })}
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Assignments Overdue"
                  value={facultyStats.overdue}
                  highlight={facultyStats.overdue > 0}
                  onClick={() => onNavigate({ page: "assignment-list", filter: "overdue" })}
                />
                <StatCard
                  icon={Send}
                  label="Low Submission Assignments"
                  value={facultyStats.lowSubmissionAssignments}
                  highlight={facultyStats.lowSubmissionAssignments > 0}
                  onClick={() => onNavigate({ page: "assignment-list", filter: "low-submission" })}
                />
                <StatCard
                  icon={Sparkles}
                  label="High AI Suspicion"
                  value={facultyStats.highAiSuspicionAssignments}
                  highlight={facultyStats.highAiSuspicionAssignments > 0}
                  onClick={() => onNavigate({ page: "assignment-list", filter: "high-ai" })}
                />
                <StatCard
                  icon={ClipboardList}
                  label="Unreviewed Submissions"
                  value={facultyStats.unreviewedSubmissions}
                  highlight={facultyStats.unreviewedSubmissions > 0}
                  onClick={() => onNavigate({ page: "assignment-list", filter: "unreviewed" })}
                />
              </>
            )}
          </div>
        </div>}

      <div>
        {showAdminDashboard && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#F59E0B] mb-4">Admin Side</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminActions.map((action) => (
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
        )}

        {showFacultyDashboard && (isAdmin ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Faculty Side (Also Available to Admin)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {facultyActions.map((action) => (
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
        ) : (
          <>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">Faculty Side</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {facultyActions.map((action) => (
                <button
                  key={action.key}
                  onClick={() => onNavigate(action.key)}
                  className="text-left px-6 py-5 rounded-2xl border border-gray-700 bg-[#1C1F23] hover:-translate-y-1 hover:bg-[#2A2F36] hover:border-[#00C2FF]/40 hover:shadow-[0_6px_18px_rgba(0,194,255,0.06)] transition-all duration-200"
                >
                  <p className="font-medium text-[#F3F4F6]">{action.label}</p>
                </button>
              ))}
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────── */
/* Main Dashboard                                 */
/* ────────────────────────────────────────────── */
const Dashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [assignmentListPresetFilter, setAssignmentListPresetFilter] = useState("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assessmentAssignmentId, setAssessmentAssignmentId] = useState(null);
  const [assessmentBackTarget, setAssessmentBackTarget] = useState({ page: "assignment-list", batchId: null });
  const [batchDetailsBatchId, setBatchDetailsBatchId] = useState(null);
  const { faculty } = useAuth();
  const isAdmin = hasAdminAccess(faculty);

  const canAccessPage = (page) => {
    if (isAdmin) {
      return FACULTY_PAGES.has(page) || ADMIN_ONLY_PAGES.has(page);
    }
    return FACULTY_PAGES.has(page);
  };

  const navigateToPage = (value) => {
    const page = typeof value === "string" ? value : value?.page;
    const presetFilter = typeof value === "object" ? value?.filter : undefined;

    if (!canAccessPage(page)) {
      setActivePage("dashboard");
      return;
    }

    if (page === "assignment-list") {
      setAssignmentListPresetFilter(presetFilter || "all");
    }

    setActivePage(page);
    setMobileSidebarOpen(false);
  };

  useEffect(() => {
    const syncFromPath = () => {
      const batchMatch = window.location.pathname.match(/^\/batches\/([^/]+)\/?$/i);
      if (batchMatch) {
        setBatchDetailsBatchId(batchMatch[1]);
        setActivePage("batch-details");
        return;
      }

      const match = window.location.pathname.match(/^\/faculty\/assignments\/([^/]+)\/assessment\/?$/i);
      if (match) {
        setAssessmentAssignmentId(match[1]);
        setAssessmentBackTarget({ page: "assignment-list", batchId: null });
        setActivePage("assignment-assessment");
        return;
      }

      setActivePage((prev) => (prev === "assignment-assessment" ? "assignment-list" : prev));
    };

    syncFromPath();
    window.addEventListener("popstate", syncFromPath);
    return () => window.removeEventListener("popstate", syncFromPath);
  }, []);

  const openAssessment = (assignmentId, options = {}) => {
    if (!assignmentId) {
      return;
    }

    setAssessmentBackTarget({
      page: options?.fromPage || activePage || "assignment-list",
      batchId: options?.batchId || batchDetailsBatchId || null,
    });
    setAssessmentAssignmentId(assignmentId);
    setActivePage("assignment-assessment");
    window.history.pushState({}, "", `/faculty/assignments/${assignmentId}/assessment`);
  };

  const closeAssessment = () => {
    if (assessmentBackTarget?.page === "batch-details" && assessmentBackTarget?.batchId) {
      setBatchDetailsBatchId(assessmentBackTarget.batchId);
      setActivePage("batch-details");
      window.history.pushState({}, "", `/batches/${assessmentBackTarget.batchId}`);
      return;
    }

    setActivePage("assignment-list");
    window.history.pushState({}, "", "/faculty/assignments");
  };

  const openBatchDetails = (batchId) => {
    if (!batchId) {
      return;
    }

    setBatchDetailsBatchId(batchId);
    setActivePage("batch-details");
    window.history.pushState({}, "", `/batches/${batchId}`);
  };

  const closeBatchDetails = () => {
    setActivePage("view-batches");
    window.history.pushState({}, "", "/faculty/batches");
  };

  useEffect(() => {
    if (!isAdmin && ADMIN_ONLY_PAGES.has(activePage)) {
      setActivePage("dashboard");
    }
  }, [activePage, isAdmin]);

  const pageTitles = {
    "dashboard":          "Dashboard",
    "pending-faculties":  "Pending Approvals",
    "all-faculties":      "All Faculties",       // ← added
    "all-students":       "All Students",       // ← added
    "create-batch":       "Create Batch",
    "view-batches":       "View Batches",
    "batch-details":      "Batch Details",
    "create-assignment":  "Create Assignment",
    "assignment-list":    "Assignment List",
    "assignment-assessment": "Evaluation",
    "create-student":     "Create Student",
    "bulk-upload":        "Bulk Upload Students",
    "settings":           "Settings",
  };

  const renderContent = () => {
    if (!canAccessPage(activePage)) {
      return <DashboardHome onNavigate={navigateToPage} isAdmin={isAdmin} />;
    }

    switch (activePage) {
      case "dashboard":         return <DashboardHome onNavigate={navigateToPage} isAdmin={isAdmin} />;
      case "pending-faculties": return <PendingFacultiesView />;
      case "all-faculties":     return <AllFaculties />;      // ← added
      case "all-students":      return <AllStudents />;       // ← added
      case "create-batch":      return <CreateBatch />;
      case "view-batches":      return <ViewBatches onOpenBatchDetails={openBatchDetails} />;
      case "batch-details":     return <BatchDetails batchId={batchDetailsBatchId} onBack={closeBatchDetails} onAssess={openAssessment} canManageManual />;
      case "create-assignment": return <CreateAssignment onNavigate={navigateToPage} />;
      case "assignment-list":   return <AssignmentList onAssess={openAssessment} initialFilter={assignmentListPresetFilter} />;
      case "assignment-assessment": return <AssignmentAssessment assignmentId={assessmentAssignmentId} onBack={closeAssessment} />;
      case "create-student":    return <CreateStudent />;
      case "bulk-upload":       return <StudentBulkUpload />;
      case "settings":          return <SettingsManagement />;
      default:                  return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F1114]">
      <Sidebar
        activePage={activePage}
        onNavigate={navigateToPage}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-[#1C1F23] border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex lg:hidden items-center justify-center w-9 h-9 rounded-lg border border-gray-700 text-gray-300 hover:text-[#F3F4F6] hover:bg-[#2A2F36]"
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          <h1 className="text-sm font-semibold text-[#F3F4F6]">
            {pageTitles[activePage] || "Dashboard"}
          </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] text-sm font-semibold">
              {faculty?.name?.[0] || "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;