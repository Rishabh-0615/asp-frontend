import { useEffect, useMemo, useState } from "react";
import { Layers3, FileText, Clock, UserCircle2, GraduationCap, Mail, BookOpen } from "lucide-react";
import StudentSidebar from "../components/layout/StudentSidebar";
import { useStudentAuth } from "../context/StudentAuthContext";

const yearLabels = {
  2: "Second Year",
  3: "Third Year",
  4: "Fourth Year",
};

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

const StudentOverview = ({ student, myBatches, onNavigate }) => (
  <div>
    <div className="mb-10">
      <h2 className="text-2xl font-semibold text-[#F3F4F6]">Welcome back, {student?.name?.split(" ")[0] || "Student"}.</h2>
      <p className="text-sm text-gray-500 mt-2">Here is your academic overview.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
      <StatCard icon={Layers3} label="My batches" value={myBatches.length} highlight={myBatches.length > 0} />
      <StatCard icon={FileText} label="Assignments" value="0" />
      <StatCard icon={Clock} label="Pending" value="0" />
      <StatCard icon={GraduationCap} label="Year" value={yearLabels[student?.year] || student?.year || "-"} />
    </div>

    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Recent Batches</h3>
            <p className="text-sm text-gray-500 mt-1">Batches where you are currently mapped.</p>
          </div>
          <button onClick={() => onNavigate("batches")} className="text-sm text-[#00C2FF] hover:text-[#7adfff] transition-colors">
            View all
          </button>
        </div>

        {myBatches.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">No faculty batch has mapped you yet.</div>
        ) : (
          <div className="divide-y divide-gray-700">
            {myBatches.slice(0, 4).map((batch) => (
              <div key={batch.batchId} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#2A2F36] transition-colors">
                <div>
                  <p className="text-[#F3F4F6] font-medium">{batch.subjectName}</p>
                  <p className="text-sm text-gray-500 mt-1">{batch.yearLabel} • {batch.division} • {batch.baseBatch}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs border border-[#00C2FF]/30 text-[#00C2FF] bg-[#00C2FF]/10">Active</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[#F3F4F6] mb-5">Current Profile</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Roll Number</p>
            <p className="text-[#F3F4F6] font-medium">{student?.rollNo}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Email</p>
            <p className="text-[#F3F4F6] font-medium break-all">{student?.email}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Department / Division</p>
            <p className="text-[#F3F4F6] font-medium">{student?.department} • {student?.division}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Base Batch</p>
            <p className="text-[#F3F4F6] font-medium">{student?.baseBatch}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudentBatchesView = ({ myBatches, loading, error }) => (
  <div>
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-[#F3F4F6]">My Batches</h2>
      <p className="text-sm text-gray-500 mt-1">These are the subject batches where faculty has added you.</p>
    </div>

    {error && <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-sm text-[#F87171]">{error}</div>}

    {myBatches.length === 0 && !loading ? (
      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
        <p className="text-[#F3F4F6] font-medium">No batches found.</p>
        <p className="text-gray-500 text-sm mt-2">Once faculty creates a subject batch and maps you, it will appear here.</p>
      </div>
    ) : (
      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-[#0F1114]">
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Year</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Division</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Base Batch</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Subject</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Created</th>
            </tr>
          </thead>
          <tbody>
            {myBatches.map((batch) => (
              <tr key={batch.batchId} className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors">
                <td className="px-6 py-4 text-gray-300">{batch.yearLabel || `Year ${batch.year}`}</td>
                <td className="px-6 py-4 text-gray-300">{batch.division}</td>
                <td className="px-6 py-4 text-gray-300">{batch.baseBatch}</td>
                <td className="px-6 py-4 text-[#F3F4F6] font-medium">{batch.subjectName}</td>
                <td className="px-6 py-4 text-gray-500">{batch.createdAt ? new Date(batch.createdAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const StudentProfileView = ({ student }) => {
  const profileItems = [
    { icon: UserCircle2, label: "Full Name", value: student?.name },
    { icon: Mail, label: "Email", value: student?.email },
    { icon: BookOpen, label: "Department", value: student?.department },
    { icon: GraduationCap, label: "Year", value: yearLabels[student?.year] || student?.year || "-" },
    { icon: UserCircle2, label: "Division", value: student?.division },
    { icon: Layers3, label: "Base Batch", value: student?.baseBatch },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#F3F4F6]">My Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Your account and academic details.</p>
      </div>

      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-8">
        <div className="grid md:grid-cols-2 gap-6">
          {profileItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-gray-700 bg-[#0F1114] p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Icon size={15} />
                <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
              </div>
              <p className="text-[#F3F4F6] font-medium">{value || "-"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StudentAssignmentsView = () => (
  <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
    <FileText size={42} className="mx-auto mb-4 text-gray-600" />
    <p className="text-[#F3F4F6] font-medium">Assignments will appear here.</p>
    <p className="text-sm text-gray-500 mt-2">This area is ready for assignment integration once faculty-side assignment mapping is connected to student batches.</p>
  </div>
);

const StudentDashboard = () => {
  const { student, myBatches, loading, fetchMyBatches } = useStudentAuth();
  const [activePage, setActivePage] = useState("overview");
  const [batchError, setBatchError] = useState(null);

  useEffect(() => {
    fetchMyBatches().catch((err) => setBatchError(err.message));
  }, []);

  const pageTitles = useMemo(
    () => ({
      overview: "Student Dashboard",
      batches: "My Batches",
      assignments: "Assignments",
      profile: "My Profile",
    }),
    []
  );

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1114]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return <StudentOverview student={student} myBatches={myBatches} onNavigate={setActivePage} />;
      case "batches":
        return <StudentBatchesView myBatches={myBatches} loading={loading} error={batchError} />;
      case "profile":
        return <StudentProfileView student={student} />;
      case "assignments":
        return <StudentAssignmentsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F1114]">
      <StudentSidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex-1 flex flex-col">
        <header className="h-16 px-8 flex items-center justify-between bg-[#1C1F23] border-b border-gray-800">
          <h1 className="text-sm font-semibold text-[#F3F4F6]">{pageTitles[activePage] || "Student Dashboard"}</h1>
          <div className="w-9 h-9 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] text-sm font-semibold">
            {student?.name?.[0] || "S"}
          </div>
        </header>

        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default StudentDashboard;
