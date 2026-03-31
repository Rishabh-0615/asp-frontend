import { useEffect, useState } from "react";
import axios from "axios";
import { Clock3, FileText, RefreshCw, Upload } from "lucide-react";
import { useAssignment } from "../context/AssignmentContext";
import { useStudentAuth } from "../context/StudentAuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const StudentAssignments = () => {
  const { getStudentAssignments, loading } = useAssignment();
  const { student } = useStudentAuth();
  const [rows, setRows] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [error, setError] = useState(null);
  const [uploadingById, setUploadingById] = useState({});
  const [uploadMessageById, setUploadMessageById] = useState({});

  const load = async () => {
    setError(null);
    try {
      const data = await getStudentAssignments();
      setRows(data || []);
    } catch (err) {
      setRows([]);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!student) {
      return;
    }

    load();
  }, [student]);

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isClosed = (row) => {
    if (row?.status) {
      return String(row.status).toUpperCase() === "CLOSED";
    }
    if (row?.deadline) {
      return new Date(row.deadline) <= new Date();
    }
    return row?.closed === true;
  };

  const subjectOptions = Array.from(
    new Set(rows.map((row) => row.subjectName).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const visibleRows =
    subjectFilter === "ALL"
      ? rows
      : rows.filter((row) => (row.subjectName || "") === subjectFilter);

  const uploadAssignment = async (assignmentId, file) => {
    if (!file) {
      return;
    }

    setUploadMessageById((prev) => ({ ...prev, [assignmentId]: null }));
    setUploadingById((prev) => ({ ...prev, [assignmentId]: true }));

    try {
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("file", file);

      const res = await axios.post(`${BASE_URL}/student/assignments/upload`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadMessageById((prev) => ({
        ...prev,
        [assignmentId]: {
          success: true,
          text: res?.data?.message || "Uploaded successfully.",
        },
      }));
    } catch (err) {
      const msg = err?.response?.data?.message || "Upload failed.";
      setUploadMessageById((prev) => ({
        ...prev,
        [assignmentId]: {
          success: false,
          text: msg,
        },
      }));
    } finally {
      setUploadingById((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-[#F3F4F6]">Assignments</h2>
          <p className="text-sm text-gray-500 mt-1">Assignments published by your faculty batches.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="ui-control"
          >
            <option value="ALL">All Subjects</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <button
            onClick={load}
            className="ui-btn ui-btn-secondary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-sm text-[#F87171]">
          {error}
        </div>
      )}

      {rows.length === 0 && !loading ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
          <FileText size={42} className="mx-auto mb-4 text-gray-600" />
          <p className="text-[#F3F4F6] font-medium">No assignments yet.</p>
          <p className="text-sm text-gray-500 mt-2">When faculty publishes assignments for your mapped batches, they appear here.</p>
        </div>
      ) : visibleRows.length === 0 && !loading ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-10 text-center">
          <p className="text-[#F3F4F6] font-medium">No assignments for selected subject.</p>
          <p className="text-sm text-gray-500 mt-2">Try another subject or choose All Subjects.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleRows.map((row) => (
            <article key={row.assignmentId} className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-6">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[#F3F4F6]">{row.title || "Untitled Assignment"}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-[#9fdaed]">
                      {row.subjectName || "Subject"}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#93C5FD]">
                      {row.yearLabel || "Year"}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-gray-800 border border-gray-600 text-gray-300">
                      {row.division || "-"} / {row.baseBatch || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium">
                    <Clock3 size={14} />
                    Deadline {formatDateTime(row.deadline)}
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      isClosed(row)
                        ? "border-red-500/40 bg-red-500/10 text-red-300"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    {isClosed(row) ? "CLOSED" : "OPEN"}
                  </span>
                </div>
              </header>

              {row.description ? (
                <p className="text-sm text-gray-300 mt-4 whitespace-pre-wrap">{row.description}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-4">No description provided.</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-lg border border-gray-700 bg-[#14171B] px-3 py-1.5 text-xs text-gray-300">
                  Published {formatDateTime(row.createdAt)}
                </span>
                <span
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs border ${
                    row.allowMultipleSubmissions
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {row.allowMultipleSubmissions
                    ? "Multiple submissions allowed"
                    : "Only one submission allowed"}
                </span>

                <input
                  id={`assignment-upload-${row.assignmentId}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    uploadAssignment(row.assignmentId, file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={isClosed(row) || !!uploadingById[row.assignmentId]}
                  onClick={() => {
                    const input = document.getElementById(`assignment-upload-${row.assignmentId}`);
                    input?.click();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#00C2FF]/40 bg-[#00C2FF]/10 px-3 py-1.5 text-xs font-medium text-[#9fdaed] hover:bg-[#00C2FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={13} />
                  {uploadingById[row.assignmentId] ? "Uploading..." : "Upload Assignment"}
                </button>
              </div>

              {uploadMessageById[row.assignmentId] && (
                <p
                  className={`mt-3 text-xs ${
                    uploadMessageById[row.assignmentId].success ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {uploadMessageById[row.assignmentId].text}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
