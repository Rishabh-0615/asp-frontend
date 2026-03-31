import { useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  ExternalLink,
  FileCode2,
  FileText,
  Link2,
  RefreshCw,
  Search,
  Smile,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useAssignment } from "../../context/AssignmentContext";

const TEXT_PREVIEW_EXTENSIONS = new Set(["cpp", "java", "txt", "html", "css"]);

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
  });
};

const formatSubmittedAt = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const downloadFile = (fileUrl, fileName) => {
  if (!fileUrl) return;
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName || "submission";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const toPercentText = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return `${Number(value)}%`;
};

const fileExt = (fileName) => {
  if (!fileName || typeof fileName !== "string") {
    return "";
  }
  const idx = fileName.lastIndexOf(".");
  return idx >= 0 ? fileName.slice(idx + 1).toLowerCase() : "";
};

const AssignmentAssessment = ({ assignmentId, onBack }) => {
  const { loading, getAssignmentAssessment } = useAssignment();

  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [showInlineFile, setShowInlineFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("ALL");

  const rows = assessment?.students || [];

  const selectedFileUrl = selectedStudent?.fileUrl || null;
  const selectedFileName = selectedStudent?.fileName || "";
  const selectedFileExt = fileExt(selectedFileName);
  const shouldPreviewAsText = TEXT_PREVIEW_EXTENSIONS.has(selectedFileExt);

  // Filter and search rows
  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Apply submission filter
    if (submissionFilter === "SUBMITTED") {
      result = result.filter((r) => r.submitted);
    } else if (submissionFilter === "NOT_SUBMITTED") {
      result = result.filter((r) => !r.submitted);
    }

    // Apply search filter (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(query)) ||
          (r.rollNo && r.rollNo.toLowerCase().includes(query))
      );
    }

    return result;
  }, [rows, submissionFilter, searchQuery]);

  const loadAssessment = async () => {
    if (!assignmentId) {
      return;
    }

    setError(null);
    try {
      const data = await getAssignmentAssessment(assignmentId);
      setAssessment(data);
    } catch (err) {
      setAssessment(null);
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, [assignmentId]);

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      setFilePreview("");
      setPreviewError(null);

      if (!selectedStudent || !selectedStudent.submitted || !selectedFileUrl || !shouldPreviewAsText) {
        return;
      }

      setPreviewLoading(true);
      try {
        const response = await fetch(selectedFileUrl);
        if (!response.ok) {
          throw new Error("Unable to load file preview.");
        }
        const text = await response.text();
        if (!cancelled) {
          setFilePreview(text);
        }
      } catch (err) {
        if (!cancelled) {
          setPreviewError(err.message || "Unable to load file preview.");
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [selectedStudent, selectedFileUrl, shouldPreviewAsText]);

  useEffect(() => {
    setShowInlineFile(false);
  }, [selectedStudent]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Students",
        value: assessment?.totalStudents ?? 0,
        tone: "text-[#F3F4F6]",
        icon: Users,
        bg: "bg-[#111317]",
      },
      {
        label: "Submitted",
        value: assessment?.submitted ?? 0,
        tone: "text-emerald-300",
        icon: CheckCircle2,
        bg: "bg-emerald-500/10",
      },
      {
        label: "Remaining",
        value: assessment?.remaining ?? 0,
        tone: "text-amber-300",
        icon: UserRound,
        bg: "bg-amber-500/10",
      },
    ],
    [assessment]
  );

  const submittedRatio =
    assessment?.totalStudents > 0
      ? Math.round(((assessment?.submitted || 0) / assessment.totalStudents) * 100)
      : 0;

  if (!assignmentId) {
    return (
      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-10 text-center">
        <p className="text-[#F3F4F6] font-medium">Assignment not selected.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div>
          <button
            type="button"
            onClick={() => onBack?.()}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-[#2A2F36] hover:text-[#F3F4F6] transition-all"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <h2 className="text-xl font-semibold text-[#F3F4F6] flex items-center gap-2">
            <FileText size={19} className="text-[#00C2FF]" />
            Assignment Evaluation
          </h2>
          <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
            <Smile size={15} className="text-emerald-300" />
            Faculty review workspace: track submissions, open files, and review AI score quickly.
          </p>
        </div>

        <button
          onClick={loadAssessment}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-gray-700 text-gray-400 hover:bg-[#2A2F36] hover:text-[#F3F4F6] transition-all min-h-11"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-md border border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#9fdaed]">
            Faculty Focus Mode
          </span>
          <span className="text-[11px] text-gray-500">Compact stats for faster review</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="sm:col-span-2 xl:col-span-2 rounded-xl border border-gray-700 bg-[#111317] p-3.5">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Assignment</p>
            <p className="text-[#F3F4F6] font-semibold text-base flex items-center gap-2">
              <FileCode2 size={18} className="text-[#00C2FF]" />
              {assessment?.assignmentTitle || "-"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-700 bg-[#111317] p-3.5">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Deadline</p>
            <p className="text-[#F59E0B] text-sm font-medium flex items-center gap-2">
              <AlarmClock size={16} />
              {formatDateTime(assessment?.deadline)}
            </p>
          </div>
          {summaryCards.map((card) => (
            <div key={card.label} className={`rounded-xl border border-gray-700 p-3.5 ${card.bg}`}>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{card.label}</p>
              <p className={`text-lg font-semibold ${card.tone} flex items-center gap-2`}>
                <card.icon size={15} />
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span>Submission Progress</span>
            <span>{submittedRatio}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#111317] border border-gray-700 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#00C2FF] to-emerald-400 transition-all duration-500"
              style={{ width: `${submittedRatio}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-sm text-[#F87171]">
          {error}
        </div>
      )}

      {!error && rows.length === 0 && !loading ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-10 text-center">
          <p className="text-[#F3F4F6] font-medium">No students mapped to this assignment batch.</p>
        </div>
      ) : (
        <>
          {/* Search and Filter Section */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search students by name or roll number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border py-2.5 pl-11 pr-4 text-sm bg-[#0E0F11] border-gray-700 text-[#F3F4F6] placeholder-gray-600 focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <select
              value={submissionFilter}
              onChange={(e) => setSubmissionFilter(e.target.value)}
              className="ui-control"
            >
              <option value="ALL">All Students</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="NOT_SUBMITTED">Not Submitted</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-700 bg-[#0F1114] text-sm text-gray-400">
              {filteredRows.length} of {rows.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
            {filteredRows.length === 0 && rows.length > 0 ? (
              <div className="p-10 text-center text-gray-400">
                <p>No results match your search or filter.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 bg-[#0F1114]">
                        <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Roll Number</th>
                        <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Student Name</th>
                        <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Submission Status</th>
                        <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Submitted At</th>
                        <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">AI Generated %</th>
                        <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row) => (
                        <tr
                          key={`${row.rollNo}-${row.name}`}
                          className="border-t border-gray-700 hover:bg-[#2A2F36]/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-300 font-mono text-xs">{row.rollNo || "-"}</td>
                          <td className="px-6 py-4 text-[#F3F4F6] font-medium">{row.name || "-"}</td>
                          <td className="px-6 py-4">
                            {row.submitted ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                                Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-red-500/40 bg-red-500/10 text-red-300">
                                Not Submitted
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-xs">
                            {row.submitted && row.submittedAt
                              ? formatSubmittedAt(row.submittedAt)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-300">{toPercentText(row.aiGeneratedPercent)}</td>
                          <td className="px-6 py-4">
                            {row.submitted && row.fileUrl ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudent(row)}
                                  title="View submission details and code"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#00C2FF]/40 bg-[#00C2FF]/10 text-[#9fdaed] hover:bg-[#00C2FF]/20 transition-colors"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadFile(row.fileUrl, row.fileName)}
                                  title="Download file"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
                                >
                                  <Download size={14} />
                                </button>
                                <a
                                  href={row.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Open file in new tab"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            ) : (
                              <span
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-700 bg-[#111317] text-gray-600"
                                title="No submission"
                              >
                                <Eye size={14} />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden p-4 space-y-3">
                  {filteredRows.map((row) => (
                    <div key={`${row.rollNo}-${row.name}`} className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-[#F3F4F6] font-medium text-sm">{row.name || "-"}</p>
                          <p className="text-xs text-gray-400 font-mono mt-1">{row.rollNo || "-"}</p>
                        </div>
                        {row.submitted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                            Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-red-500/40 bg-red-500/10 text-red-300">
                            Not Submitted
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="rounded-lg border border-gray-700 bg-[#111317] p-2.5">
                          <p className="text-gray-500">Submitted At</p>
                          <p className="text-gray-300 mt-1">{row.submitted && row.submittedAt ? formatSubmittedAt(row.submittedAt) : "-"}</p>
                        </div>
                        <div className="rounded-lg border border-gray-700 bg-[#111317] p-2.5">
                          <p className="text-gray-500">AI Generated</p>
                          <p className="text-gray-300 mt-1">{toPercentText(row.aiGeneratedPercent)}</p>
                        </div>
                      </div>

                      {row.submitted && row.fileUrl ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(row)}
                            className="flex-1 min-h-10 px-3 py-2 rounded-lg border border-[#00C2FF]/40 bg-[#00C2FF]/10 text-[#9fdaed] text-xs"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadFile(row.fileUrl, row.fileName)}
                            className="flex-1 min-h-10 px-3 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs"
                          >
                            Download
                          </button>
                          <a
                            href={row.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 min-h-10 inline-flex items-center justify-center px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs"
                          >
                            Open
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-[#0F1114]/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="flex-1 min-h-11 px-3 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm"
          >
            Back
          </button>
          <button
            type="button"
            onClick={loadAssessment}
            className="flex-1 min-h-11 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#1C1F23] border border-gray-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-[#F3F4F6] font-semibold flex items-center gap-2">
                <FileCode2 size={17} className="text-[#00C2FF]" />
                Submission Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-[#F3F4F6]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Student Name</p>
                  <p className="text-[#F3F4F6] font-medium">{selectedStudent.name || "-"}</p>
                </div>
                <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Roll Number</p>
                  <p className="text-[#F3F4F6] font-medium">{selectedStudent.rollNo || "-"}</p>
                </div>
                <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">File Name</p>
                  <p className="text-[#F3F4F6] font-medium break-all">{selectedStudent.fileName || "-"}</p>
                </div>
                <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">AI Generated %</p>
                  <p className="text-[#F3F4F6] font-medium">{toPercentText(selectedStudent.aiGeneratedPercent)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowInlineFile((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-700 bg-[#111317] text-[#F3F4F6] hover:bg-[#1A1D22]"
                >
                  <Link2 size={14} />
                  {showInlineFile ? "Hide Inline Preview" : "Open Submission Here"}
                </button>
                <a
                  href={selectedStudent.fileUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-sm border border-[#00C2FF]/40 bg-[#00C2FF]/10 text-[#9fdaed] hover:bg-[#00C2FF]/20"
                >
                  Open Original File
                </a>
              </div>

              {showInlineFile && selectedStudent.fileUrl && !shouldPreviewAsText && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">In-Page File View</p>
                  <div className="bg-[#0F1114] border border-gray-700 rounded-xl overflow-hidden h-105">
                    <iframe
                      title="Submission file preview"
                      src={selectedStudent.fileUrl}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {shouldPreviewAsText && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">File Preview</p>
                  <div className="bg-[#0F1114] border border-gray-700 rounded-xl p-4 max-h-80 overflow-auto">
                    {previewLoading ? (
                      <p className="text-sm text-gray-400">Loading file preview...</p>
                    ) : previewError ? (
                      <p className="text-sm text-red-300">{previewError}</p>
                    ) : (
                      <pre className="text-xs text-gray-200 whitespace-pre-wrap wrap-break-word">{filePreview || "No preview available."}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentAssessment;
