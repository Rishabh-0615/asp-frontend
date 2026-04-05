import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Download, Eye, FileText, RefreshCw, UploadCloud, X } from "lucide-react";
import { useBatch } from "../../context/BatchContext";
import axios from "axios";
import AssignmentUploadModal from "../../components/AssignmentUploadModal";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const STUDENT_ALLOWED_UPLOAD_TYPES = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "jpg", "jpeg", "png", "txt", "md",
  "c", "cpp", "cc", "cxx", "h", "hpp",
  "java", "py", "js", "jsx", "ts", "tsx",
  "html", "css", "sql", "json", "xml", "yaml", "yml",
  "zip", "rar", "7z"
];

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined,
  });
};

const BatchDetails = ({ batchId, onBack, onAssess, canManageManual = false, isStudentView = false }) => {
  const { loading, getBatchDetails, getStudentBatchDetails } = useBatch();

  const [activeTab, setActiveTab] = useState("assignments");
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [manualAssignmentId, setManualAssignmentId] = useState("");
  const [manuals, setManuals] = useState([]);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualMessage, setManualMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [sortBy, setSortBy] = useState("deadline-asc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [uploadingById, setUploadingById] = useState({});
  const [uploadMessageById, setUploadMessageById] = useState({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeUploadRow, setActiveUploadRow] = useState(null);
  const manualInputRef = useRef(null);
  const sortMenuRef = useRef(null);
  const navigate = useNavigate();

  const load = async () => {
    if (!batchId) {
      return;
    }

    setError(null);
    try {
      const data = isStudentView
        ? await getStudentBatchDetails(batchId)
        : await getBatchDetails(batchId);
      setDetails(data);
    } catch (err) {
      setDetails(null);
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [batchId, isStudentView]);

  useEffect(() => {
    if (!sortMenuOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (!sortMenuRef.current?.contains(event.target)) {
        setSortMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sortMenuOpen]);

  const header = details?.header || {};
  const assignments = details?.assignments || [];
  const students = details?.students || [];

  useEffect(() => {
    if (!assignments.length) {
      setManualAssignmentId("");
      setManuals([]);
      return;
    }

    const exists = assignments.some((row) => row.assignmentId === manualAssignmentId);
    if (!manualAssignmentId || !exists) {
      setManualAssignmentId(assignments[0].assignmentId);
    }
  }, [assignments, manualAssignmentId]);

  const fetchManuals = async () => {
    setManualLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/submissions/batch/${batchId}/lab-manuals`);
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setManuals(list);
    } catch (_) {
      setManuals([]);
    } finally {
      setManualLoading(false);
    }
  };

  useEffect(() => {
    if (!batchId) {
      setManuals([]);
      return;
    }
    fetchManuals();
  }, [batchId]);

  const sortedAssignments = useMemo(() => {
    const clone = [...assignments];

    const progressValue = (row) => {
      const total = Number(row?.totalStudents ?? 0);
      if (total <= 0) {
        return 0;
      }
      return Number(row?.submitted ?? 0) / total;
    };

    clone.sort((a, b) => {
      if (sortBy === "deadline-asc" || sortBy === "deadline-desc") {
        const aTime = a?.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b?.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        return sortBy === "deadline-asc" ? aTime - bTime : bTime - aTime;
      }

      const aProgress = progressValue(a);
      const bProgress = progressValue(b);
      if (sortBy === "progress-desc") {
        return bProgress - aProgress;
      }
      return aProgress - bProgress;
    });

    return clone;
  }, [assignments, sortBy]);

  const triggerManualPicker = () => {
    if (!batchId) {
      setManualMessage("Batch information is unavailable.");
      return;
    }
    manualInputRef.current?.click();
  };

  const onManualFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setManualSaving(true);
    setManualMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `${BASE_URL}/faculty/batches/${batchId}/lab-manual/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setManualMessage(`Manual uploaded: ${file.name}`);
      await fetchManuals();
    } catch (err) {
      setManualMessage(err?.response?.data?.message || "Manual upload failed.");
    } finally {
      setManualSaving(false);
    }
    event.target.value = "";
  };

  const closePreview = () => {
    if (previewSrc) {
      URL.revokeObjectURL(previewSrc);
    }
    setPreviewSrc("");
    setPreviewLoading(false);
    setPreviewError("");
    setPreviewOpen(false);
  };

  const handlePreviewClick = async () => {
    if (!latestManual?.id) {
      setManualMessage("File information not available.");
      return;
    }

    if (previewSrc) {
      URL.revokeObjectURL(previewSrc);
      setPreviewSrc("");
    }

    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/api/submissions/lab-manuals/${latestManual.id}/download`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blobUrl = URL.createObjectURL(res.data);
      setPreviewSrc(blobUrl);
    } catch (err) {
      setPreviewError("Unable to preview this PDF.");
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadClick = async () => {
    if (!latestManual?.id || !latestManual?.fileName) {
      setManualMessage("File information not available.");
      return;
    }

    try {
      const res = await axios.get(
        `${BASE_URL}/api/submissions/lab-manuals/${latestManual.id}/download`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = latestManual.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setManualMessage("Downloaded successfully.");
    } catch (err) {
      setManualMessage("Failed to download file.");
      console.error(err);
    }
  };

  const latestManual = manuals.length > 0 ? manuals[0] : null;

  const isClosed = (row) => {
    if (row?.closed === true || row?.isOpen === false) {
      return true;
    }
    if (!row?.deadline) {
      return false;
    }
    return new Date(row.deadline) <= new Date();
  };

  const uploadAssignment = async (assignmentId, file) => {
    if (!file) {
      return false;
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
      await load();
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || "Upload failed.";
      setUploadMessageById((prev) => ({
        ...prev,
        [assignmentId]: {
          success: false,
          text: msg,
        },
      }));
      return false;
    } finally {
      setUploadingById((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  const openUploadModal = (row) => {
    setActiveUploadRow(row);
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    if (activeUploadRow && uploadingById[activeUploadRow.assignmentId]) {
      return;
    }
    setUploadModalOpen(false);
    setActiveUploadRow(null);
  };

  const sortLabel = {
    "deadline-asc": "Deadline: Earliest first",
    "deadline-desc": "Deadline: Latest first",
    "progress-desc": "Progress: High to low",
    "progress-asc": "Progress: Low to high",
  };

  if (!batchId) {
    return (
      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-10 text-center">
        <p className="text-[#F3F4F6] font-medium">Batch not selected.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <button
            type="button"
            onClick={() => onBack?.()}
            className="ui-btn ui-btn-secondary mb-3 px-3 py-1.5 text-xs"
          >
            <ArrowLeft size={14} />
            Back to My Batches
          </button>
          <h2 className="text-xl font-semibold text-[#F3F4F6]">Batch Workspace</h2>
          <p className="text-sm text-gray-500 mt-1">Track assignment and student progress for this batch.</p>
        </div>

        <button
          onClick={load}
          className="ui-btn ui-btn-secondary"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-sm text-[#F87171]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-[#1C1F23] border border-gray-700 rounded-2xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Batch Name</p>
              <p className="text-[#F3F4F6] font-semibold mt-1">{header.batchName || "-"}</p>
            </div>
            <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Subject</p>
              <p className="text-[#F3F4F6] font-semibold mt-1">{header.subjectName || "-"}</p>
            </div>
            <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Faculty Name</p>
              <p className="text-gray-300 mt-1">{header.facultyName || "-"}</p>
            </div>
            <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Class Profile</p>
              <p className="text-gray-300 mt-1">
                {header.yearLabel || "-"} / {header.division || "-"}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-3 flex-wrap text-sm">
            <span className="px-3 py-1.5 rounded-lg bg-[#00C2FF]/10 border border-[#00C2FF]/25 text-[#9fdaed]">
              Students: {header.totalStudents ?? 0}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
              Assignments: {header.totalAssignments ?? 0}
            </span>
          </div>
        </div>

        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-[#00C2FF]" />
            <h3 className="text-sm font-semibold text-[#F3F4F6]">Lab Manual</h3>
          </div>
          <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4 mb-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Manual Name</p>
            <p className="text-sm text-gray-300 mt-1">
              {manualLoading ? "Loading..." : latestManual?.fileName || "No manual uploaded yet"}
            </p>
          </div>
          <input
            ref={manualInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onManualFileSelect}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
            <button
              type="button"
              disabled={!latestManual?.fileUrl}
              onClick={handlePreviewClick}
              className="ui-btn ui-btn-secondary"
            >
              <Eye size={14} />
              Preview
            </button>
            <button
              type="button"
              disabled={!latestManual?.id}
              onClick={handleDownloadClick}
              className="ui-btn ui-btn-secondary"
            >
              <Download size={14} />
              Download
            </button>
            {canManageManual && (
              <button
                type="button"
                disabled={!batchId || manualSaving}
                onClick={triggerManualPicker}
                className="ui-btn ui-btn-accent"
              >
                <UploadCloud size={14} />
                {manualSaving ? "Uploading..." : latestManual ? "Change Manual" : "Upload Manual"}
              </button>
            )}
          </div>
          {manualMessage && (
            <p className="mt-3 text-xs text-[#9fdaed]">{manualMessage}</p>
          )}
        </div>
      </div>

      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl">
        <div className="px-4 pt-4 border-b border-gray-700">
          <div className="inline-flex rounded-xl border border-gray-700 bg-[#0F1114] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "assignments" ? "bg-[#00C2FF] text-[#0E0F11]" : "text-gray-400 hover:text-[#F3F4F6]"}`}
            >
              Assignments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "students" ? "bg-[#00C2FF] text-[#0E0F11]" : "text-gray-400 hover:text-[#F3F4F6]"}`}
            >
              Students
            </button>
          </div>
        </div>

        {activeTab === "assignments" ? (
          <div className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Assignments in this batch</p>
              <div ref={sortMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSortMenuOpen((prev) => !prev)}
                  className="ui-btn ui-btn-secondary min-h-10 text-xs"
                >
                  {sortLabel[sortBy]}
                  <ChevronDown size={14} className={`${sortMenuOpen ? "rotate-180" : ""} transition-transform`} />
                </button>

                {sortMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-700 bg-[#1C1F23] shadow-lg z-20 overflow-hidden">
                    {Object.entries(sortLabel).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSortBy(key);
                          setSortMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${sortBy === key ? "bg-[#00C2FF]/15 text-[#9fdaed]" : "text-gray-300 hover:bg-[#2A2F36]"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {sortedAssignments.length === 0 ? (
              <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-[#F3F4F6] font-medium">No assignments in this batch yet.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-gray-700 bg-[#0F1114]">
                        <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Assignment Title</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Deadline</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Submission Progress</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAssignments.map((row) => {
                        const total = Number(row?.totalStudents ?? 0);
                        const submitted = Number(row?.submitted ?? 0);
                        const progressPercent = total > 0 ? Math.round((submitted / total) * 100) : 0;

                        return (
                          <tr key={row.assignmentId} className="border-b border-gray-700 hover:bg-[#2A2F36] transition-colors">
                            <td className="px-4 py-4">
                              <p className="text-[#F3F4F6] font-medium">{row.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{row.description || "No description"}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${isClosed(row) ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}`}>
                                  {isClosed(row) ? "CLOSED" : "OPEN"}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${row.allowMultipleSubmissions ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"}`}>
                                  {row.allowMultipleSubmissions ? "Multiple submissions" : "Single submission"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[#F59E0B]">{formatDateTime(row.deadline)}</td>
                            <td className="px-4 py-4">
                              <p className="text-gray-300 text-xs mb-1">{submitted} / {total} submissions</p>
                              <div className="h-2 rounded-full bg-[#0F1114] border border-gray-700 overflow-hidden max-w-52">
                                <div
                                  className="h-full bg-linear-to-r from-[#00C2FF] to-emerald-400"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {!isStudentView && (
                                  <button
                                    type="button"
                                    onClick={() => onAssess?.(row.assignmentId, { fromPage: "batch-details", batchId })}
                                    className="ui-btn ui-btn-accent min-h-9 px-3 py-1.5 text-xs"
                                  >
                                    Evaluate
                                  </button>
                                )}
                                {isStudentView && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isClosed(row) || !!uploadingById[row.assignmentId]}
                                      onClick={() => navigate(`/student/assignments/${row.assignmentId}`)}
                                      className="ui-btn ui-btn-accent min-h-9 px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {uploadingById[row.assignmentId] ? "Uploading..." : "Upload Assignment"}
                                    </button>
                                  </>
                                )}
                              </div>
                              {isStudentView && uploadMessageById[row.assignmentId] && (
                                <p className={`mt-2 text-xs ${uploadMessageById[row.assignmentId].success ? "text-emerald-300" : "text-red-300"}`}>
                                  {uploadMessageById[row.assignmentId].text}
                                </p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {sortedAssignments.map((row) => {
                    const total = Number(row?.totalStudents ?? 0);
                    const submitted = Number(row?.submitted ?? 0);
                    const progressPercent = total > 0 ? Math.round((submitted / total) * 100) : 0;

                    return (
                      <div key={row.assignmentId} className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
                        <p className="text-[#F3F4F6] font-medium text-sm">{row.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{row.description || "No description"}</p>
                        <p className="text-xs text-[#F59E0B] mt-1">{formatDateTime(row.deadline)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${isClosed(row) ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}`}>
                            {isClosed(row) ? "CLOSED" : "OPEN"}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${row.allowMultipleSubmissions ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"}`}>
                            {row.allowMultipleSubmissions ? "Multiple submissions" : "Single submission"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-3 mb-1">{submitted} / {total} submissions</p>
                        <div className="h-2 rounded-full bg-[#111317] border border-gray-700 overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-[#00C2FF] to-emerald-400"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {!isStudentView && (
                            <button
                              type="button"
                              onClick={() => onAssess?.(row.assignmentId, { fromPage: "batch-details", batchId })}
                              className="ui-btn ui-btn-accent min-h-10 px-3 py-2 text-xs"
                            >
                              Evaluate
                            </button>
                          )}
                          {isStudentView && (
                            <>
                              <button
                                type="button"
                                disabled={isClosed(row) || !!uploadingById[row.assignmentId]}
                                onClick={() => navigate(`/student/assignments/${row.assignmentId}`)}
                                className="ui-btn ui-btn-accent col-span-2 min-h-10 px-3 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {uploadingById[row.assignmentId] ? "Uploading..." : "Upload Assignment"}
                              </button>
                            </>
                          )}
                        </div>
                        {isStudentView && uploadMessageById[row.assignmentId] && (
                          <p className={`mt-2 text-xs ${uploadMessageById[row.assignmentId].success ? "text-emerald-300" : "text-red-300"}`}>
                            {uploadMessageById[row.assignmentId].text}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-4">
            {students.length === 0 ? (
              <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-[#F3F4F6] font-medium">No students found for this batch.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-gray-700 bg-[#0F1114]">
                        <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Roll Number</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Student Name</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide">Assignments Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((row) => (
                        <tr key={row.studentId} className="border-b border-gray-700 hover:bg-[#2A2F36] transition-colors">
                          <td className="px-4 py-4 text-gray-300">{row.rollNo || "-"}</td>
                          <td className="px-4 py-4 text-[#F3F4F6] font-medium">{row.name || "-"}</td>
                          <td className="px-4 py-4 text-[#00C2FF] font-semibold">
                            {row.submittedAssignments ?? 0} / {row.totalAssignments ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {students.map((row) => (
                    <div key={row.studentId} className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
                      <p className="text-[#F3F4F6] font-medium text-sm">{row.name || "-"}</p>
                      <p className="text-xs text-gray-400 mt-1">Roll No: {row.rollNo || "-"}</p>
                      <p className="text-sm text-[#00C2FF] mt-3 font-semibold">
                        {row.submittedAssignments ?? 0} / {row.totalAssignments ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[90vh] bg-[#111317] border border-gray-700 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-[#1C1F23]">
              <h2 className="text-lg font-semibold text-[#F3F4F6]">Lab Manual Preview</h2>
              <button
                type="button"
                onClick={closePreview}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-700 bg-[#111317] text-gray-300 hover:text-[#F3F4F6] hover:bg-gray-700 transition-colors"
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#0F1114] p-4">
              {previewLoading && (
                <div className="h-full flex items-center justify-center text-gray-400">Loading preview...</div>
              )}
              {!previewLoading && previewError && (
                <div className="h-full flex items-center justify-center text-red-300">{previewError}</div>
              )}
              {!previewLoading && !previewError && previewSrc ? (
                <iframe
                  src={previewSrc}
                  title="Lab Manual Preview"
                  className="w-full h-full border-0 rounded-lg bg-white"
                />
              ) : (
                !previewLoading && !previewError && (
                  <div className="h-full flex items-center justify-center text-gray-400">Preparing preview...</div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <AssignmentUploadModal
        isOpen={uploadModalOpen}
        onClose={closeUploadModal}
        assignment={activeUploadRow}
        allowedTypes={STUDENT_ALLOWED_UPLOAD_TYPES}
        uploading={activeUploadRow ? !!uploadingById[activeUploadRow.assignmentId] : false}
        onSubmit={(file) => activeUploadRow ? uploadAssignment(activeUploadRow.assignmentId, file) : Promise.resolve(false)}
      />
    </div>
  );
};

export default BatchDetails;
