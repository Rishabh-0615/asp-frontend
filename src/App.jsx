import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useStudentAuth } from "./context/StudentAuthContext";

// Auth Pages
import AuthPage from "./pages/Auth";
import StudentLogin from "./pages/StudentLogin";
import ForgotPasswordStudent from "./pages/ForgotPasswordStudent";
import ForgotPasswordFaculty from "./pages/ForgotPasswordFaculty";

// Layouts
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";

// Auth Wrappers
const AuthPageWrapper = () => {
  const navigate = useNavigate();
  return <AuthPage onForgotPassword={() => navigate("/forgot-password")} />;
};

const StudentLoginWrapper = () => {
  const navigate = useNavigate();
  return <StudentLogin onForgotPassword={() => navigate("/student/forgot-password")} />;
};

const ForgotPasswordFacultyWrapper = () => {
  const navigate = useNavigate();
  return <ForgotPasswordFaculty onBack={() => navigate("/")} />;
};

const ForgotPasswordStudentWrapper = () => {
  const navigate = useNavigate();
  return <ForgotPasswordStudent onBack={() => navigate("/student/login")} />;
};

// Faculty Subcomponents
import { DashboardHome, PendingFacultiesView } from "./pages/Dashboard";
import CreateStudent from "./pages/admin/CreateStudent";
import StudentBulkUpload from "./pages/admin/StudentBulkUpload";
import AllFaculties from "./pages/admin/AllFaculties";
import AllStudents from "./pages/admin/AllStudents";
import CreateBatch from "./pages/admin/CreateBatch";
import ViewBatches from "./pages/admin/ViewBatches";
import CreateAssignment from "./pages/admin/CreateAssignment";
import AssignmentList from "./pages/admin/AssignmentList";
import AssignmentAssessment from "./pages/admin/AssignmentAssessment";
import SettingsManagement from "./pages/admin/SettingsManagement";
import BatchDetails from "./pages/admin/BatchDetails";
import MarksEvaluation from "./pages/admin/MarksEvaluation";
import Profile from "./pages/admin/Profile";

// Student Subcomponents
import { StudentOverview, StudentBatchesView, StudentProfileView } from "./pages/StudentDashboard";
import StudentAssignments from "./pages/StudentAssignments";
import AssignmentDetails from "./pages/AssignmentDetails";
import StudentMarksView from "./pages/StudentMarksView";

/* ── Fullscreen loader ── */
const AppLoader = () => (
  <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-gray-800" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00C2FF] animate-spin" />
    </div>
    <p className="text-sm text-gray-500 tracking-wide">Loading...</p>
  </div>
);

// Wrappers for URL Params and Prop Actions
const ViewBatchesWrapper = () => {
  const navigate = useNavigate();
  return <ViewBatches onOpenBatchDetails={(id) => navigate(`/faculty/batches/${id}`)} />;
};

const CreateAssignmentWrapper = () => {
  const navigate = useNavigate();
  return <CreateAssignment onNavigate={(route) => navigate(`/faculty/${route?.page || route}`)} />;
};

const AssignmentListWrapper = () => {
  const navigate = useNavigate();
  return <AssignmentList onAssess={(id) => navigate(`/faculty/assignments/${id}/assessment`)} />;
};

const BatchDetailsWrapper = ({ isStudentView = false }) => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  return (
    <BatchDetails 
      batchId={batchId} 
      isStudentView={isStudentView} 
      onBack={() => navigate(-1)} 
      onAssess={(id) => navigate(`/faculty/assignments/${id}/assessment`)}
      onEvaluateMarks={(id) => navigate(`/faculty/assignments/${id}/marks`)}
      canManageManual={!isStudentView}
    />
  );
};

const AssignmentAssessmentWrapper = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  return (
    <AssignmentAssessment 
      assignmentId={assignmentId} 
      onBack={() => navigate(-1)} 
      onEvaluateMarks={(id) => navigate(`/faculty/assignments/${id}/marks`)} 
    />
  );
};

const MarksEvaluationWrapper = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  return <MarksEvaluation assignmentId={assignmentId} onBack={() => navigate(-1)} />;
};

const StudentAssignmentsWrapper = () => {
  const navigate = useNavigate();
  return (
    <StudentAssignments 
      onOpenAssignmentDetails={(id) => navigate(`/student/assignments/${id}`)}
      onOpenMarksView={() => navigate(`/student/marks`)}
    />
  );
};

const AssignmentDetailsWrapper = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  return <AssignmentDetails assignmentId={assignmentId} onBack={() => navigate(-1)} />;
};

const StudentMarksWrapper = () => {
  const navigate = useNavigate();
  const { student } = useStudentAuth();
  return <StudentMarksView studentId={student?.id} onBack={() => navigate(-1)} />;
};

// Route Guards
const FacultyRoute = ({ children }) => {
  const { isLoggedIn, initializing } = useAuth();
  if (initializing) return <AppLoader />;
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return children;
};

const StudentRoute = ({ children }) => {
  const { isLoggedIn, loading } = useStudentAuth();
  if (loading) return <AppLoader />;
  if (!isLoggedIn()) return <Navigate to="/student/login" replace />;
  return children;
};

const AuthFacultyRoute = ({ children }) => {
  const { isLoggedIn, initializing } = useAuth();
  if (initializing) return <AppLoader />;
  if (isLoggedIn()) return <Navigate to="/faculty/dashboard" replace />;
  return children;
};

const AuthStudentRoute = ({ children }) => {
  const { isLoggedIn, loading , student} = useStudentAuth();
  if (loading) return <AppLoader />;
  if (student) return <Navigate to="/student/dashboard" replace />;
  return children;
};
const AuthCombinedRoute = ({ children }) => {
  const { isLoggedIn: isFacultyLoggedIn, initializing } = useAuth();
  const { isLoggedIn: isStudentLoggedIn, loading } = useStudentAuth();

  if (initializing || loading) return <AppLoader />;

  if (isFacultyLoggedIn()) return <Navigate to="/faculty/dashboard" replace />;
  if (isStudentLoggedIn()) return <Navigate to="/student/dashboard" replace />;

  return children;
};

const App = () => { 
  return (
    <Routes>
      {/* Auth Routes with protections */}
      <Route path="/" element={<AuthCombinedRoute><AuthPageWrapper /></AuthCombinedRoute>} />
      <Route path="/forgot-password" element={<AuthFacultyRoute><ForgotPasswordFacultyWrapper /></AuthFacultyRoute>} />
      
      <Route path="/student/login" element={<AuthStudentRoute><StudentLoginWrapper /></AuthStudentRoute>} />
      <Route path="/student/forgot-password" element={<AuthStudentRoute><ForgotPasswordStudentWrapper /></AuthStudentRoute>} />

      {/* Faculty Routes */}
      <Route path="/faculty" element={<FacultyRoute><Dashboard /></FacultyRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="pending-faculties" element={<PendingFacultiesView />} />
        <Route path="all-faculties" element={<AllFaculties />} />
        <Route path="all-students" element={<AllStudents />} />
        <Route path="create-student" element={<CreateStudent />} />
        <Route path="bulk-upload" element={<StudentBulkUpload />} />
        <Route path="batches/create" element={<CreateBatch />} />
        <Route path="batches" element={<ViewBatchesWrapper />} />
        <Route path="batches/:batchId" element={<BatchDetailsWrapper />} />
        <Route path="assignments/create" element={<CreateAssignmentWrapper />} />
        <Route path="assignments" element={<AssignmentListWrapper />} />
        <Route path="assignments/:assignmentId/assessment" element={<AssignmentAssessmentWrapper />} />
        <Route path="assignments/:assignmentId/marks" element={<MarksEvaluationWrapper />} />
        <Route path="settings" element={<SettingsManagement />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentOverview />} />
        <Route path="batches" element={<StudentBatchesView />} />
        <Route path="batches/:batchId" element={<BatchDetailsWrapper isStudentView />} />
        <Route path="assignments" element={<StudentAssignmentsWrapper />} />
        <Route path="assignments/:assignmentId" element={<AssignmentDetailsWrapper />} />
        <Route path="profile" element={<StudentProfileView />} />
        <Route path="marks" element={<StudentMarksWrapper />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;