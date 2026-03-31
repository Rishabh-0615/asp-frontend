import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useBatch } from "../../context/BatchContext";
import { useAssignment } from "../../context/AssignmentContext";

const FILTER_OPTIONS = [
  { value: "all", label: "All assignments" },
  { value: "due-today", label: "Due today" },
  { value: "overdue", label: "Overdue" },
  { value: "low-submission", label: "Low submissions" },
  { value: "high-ai", label: "High AI suspicion" },
  { value: "unreviewed", label: "Unreviewed submissions" },
];

const LOW_SUBMISSION_RATIO = 0.4;
const HIGH_AI_THRESHOLD = 70;

const isDueToday = (deadline) => {
  if (!deadline) {
    return false;
  }
  const d = new Date(deadline);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const isOverdue = (deadline, isOpen) => {
  if (!deadline) {
    return false;
  }
  return new Date(deadline) < new Date() && isOpen === false;
};

const AssignmentList = ({ onAssess, initialFilter = "all" }) => {
  const { getMyBatches } = useBatch();
  const { getFacultyAssignments, getAssignmentAssessment, loading } = useAssignment();

  const [rows, setRows] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [commandFilter, setCommandFilter] = useState(initialFilter || "all");
  const [assessmentMeta, setAssessmentMeta] = useState({});
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBatches = async () => {
    try {
      const data = await getMyBatches();
      setBatches(data || []);
    } catch (err) {
      // Keep last successful data to avoid UI collapsing on transient network issues.
      setError((prev) => prev || err.message);
    }
  };

  const preloadAssessmentMeta = async (sourceRows) => {
    const needsAssessment = (sourceRows || []).filter((row) => (row?.submittedCount ?? 0) > 0);

    if (needsAssessment.length === 0) {
      setAssessmentLoading(false);
      return;
    }

    setAssessmentLoading(true);
    const settled = await Promise.allSettled(
      needsAssessment.map((row) =>
        getAssignmentAssessment(row.assignmentId, { backgroundRefresh: true }).then((assessment) => ({
          assignmentId: row.assignmentId,
          highAiCount: (assessment?.students || []).filter(
            (student) => student?.submitted && Number(student?.aiGeneratedPercent ?? 0) >= HIGH_AI_THRESHOLD
          ).length,
          unreviewedCount: (assessment?.students || []).filter(
            (student) => student?.submitted && (student?.aiGeneratedPercent === null || student?.aiGeneratedPercent === undefined)
          ).length,
        }))
      )
    );

    const nextMeta = {};
    settled.forEach((item) => {
      if (item.status !== "fulfilled") {
        return;
      }
      nextMeta[item.value.assignmentId] = {
        highAiCount: item.value.highAiCount,
        unreviewedCount: item.value.unreviewedCount,
      };
    });

    setAssessmentMeta((prev) => ({ ...prev, ...nextMeta }));
    setAssessmentLoading(false);
  };

  const loadAssignments = async (selectedBatchId = "", options = {}) => {
    const { forceRefresh = false } = options;
    setError(null);
    try {
      const data = await getFacultyAssignments(selectedBatchId || undefined, {
        forceRefresh,
        backgroundRefresh: !forceRefresh,
        onBackgroundData: (freshData) => {
          setRows(freshData || []);
          preloadAssessmentMeta(freshData || []);
        },
      });
      setRows(data || []);
      preloadAssessmentMeta(data || []);
    } catch (err) {
      setError(err.message);
      // Keep previous rows visible when refresh fails.
    }
  };

  useEffect(() => {
    loadBatches();
    loadAssignments("", { forceRefresh: false });
  }, []);

  useEffect(() => {
    setCommandFilter(initialFilter || "all");
  }, [initialFilter]);

  const onFilterChange = async (value) => {
    setBatchId(value);
    await loadAssignments(value, { forceRefresh: false });
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (commandFilter === "due-today") {
        return isDueToday(row.deadline);
      }

      if (commandFilter === "overdue") {
        return isOverdue(row.deadline, row.isOpen);
      }

      if (commandFilter === "low-submission") {
        const totalStudents = Number(row?.totalStudents ?? 0);
        if (totalStudents <= 0) {
          return false;
        }
        const submittedCount = Number(row?.submittedCount ?? 0);
        return submittedCount / totalStudents < LOW_SUBMISSION_RATIO;
      }

      if (commandFilter === "high-ai") {
        return Number(assessmentMeta[row.assignmentId]?.highAiCount ?? 0) > 0;
      }

      if (commandFilter === "unreviewed") {
        return Number(assessmentMeta[row.assignmentId]?.unreviewedCount ?? 0) > 0;
      }

      return true;
    });
  }, [rows, commandFilter, assessmentMeta]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-[#F3F4F6]">My Assignments</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredRows.length} assignment{filteredRows.length !== 1 ? "s" : ""} found.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={batchId}
            onChange={(e) => onFilterChange(e.target.value)}
            className="ui-control"
          >
            <option value="">All batches</option>
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>
                {batch.subjectName} - {batch.division} - {batch.baseBatch}
              </option>
            ))}
          </select>

          <select
            value={commandFilter}
            onChange={(e) => setCommandFilter(e.target.value)}
            className="ui-control"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => loadAssignments(batchId, { forceRefresh: true })}
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

      {(commandFilter === "high-ai" || commandFilter === "unreviewed") && assessmentLoading && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[#00C2FF]/10 border border-[#00C2FF]/25 text-xs text-[#9fdaed]">
          Updating AI and review insights in background...
        </div>
      )}

      {loading && rows.length === 0 ? (
        <>
          <div className="hidden md:block bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-10 rounded-lg bg-[#2A2F36] animate-pulse" />
              ))}
            </div>
          </div>
          <div className="md:hidden space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-2/3 rounded bg-[#2A2F36] mb-2" />
                <div className="h-4 w-1/2 rounded bg-[#2A2F36] mb-2" />
                <div className="h-8 w-24 rounded bg-[#2A2F36]" />
              </div>
            ))}
          </div>
        </>
      ) : filteredRows.length === 0 && !loading && !error ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
          <p className="text-[#F3F4F6] font-medium">No assignments found.</p>
          <p className="text-gray-500 text-sm mt-2">Try changing the filters or create one from the Create Assignment tab.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-[#0F1114]">
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Subject</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Batch</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Submitted</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Deadline</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Open</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Created</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.assignmentId} className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors">
                    <td className="px-6 py-4 text-[#F3F4F6] font-medium">{row.title}</td>
                    <td className="px-6 py-4 text-gray-300">{row.subjectName || "-"}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {row.yearLabel || "-"} / {row.division || "-"} / {row.baseBatch || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium">
                      {`${row.submittedCount ?? 0} / ${row.totalStudents ?? 0}`}
                    </td>
                    <td className="px-6 py-4 text-[#F59E0B] font-medium">
                      {row.deadline ? new Date(row.deadline).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{row.isOpen ? "Yes" : "No"}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onAssess?.(row.assignmentId)}
                        className="px-3 py-1.5 rounded-lg border border-[#00C2FF]/40 bg-[#00C2FF]/10 text-[#9fdaed] text-xs font-medium hover:bg-[#00C2FF]/20"
                      >
                        Evaluation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3 pb-24">
            {filteredRows.map((row) => (
              <div key={row.assignmentId} className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[#F3F4F6] font-medium text-sm">{row.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{row.subjectName || "-"}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full border ${row.isOpen ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" : "border-red-500/40 text-red-300 bg-red-500/10"}`}>
                    {row.isOpen ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="bg-[#0F1114] border border-gray-700 rounded-lg p-2.5">
                    <p className="text-gray-500">Batch</p>
                    <p className="text-gray-300 mt-1">{row.yearLabel || "-"} / {row.division || "-"}</p>
                  </div>
                  <div className="bg-[#0F1114] border border-gray-700 rounded-lg p-2.5">
                    <p className="text-gray-500">Submissions</p>
                    <p className="text-[#00C2FF] mt-1 font-semibold">{`${row.submittedCount ?? 0} / ${row.totalStudents ?? 0}`}</p>
                  </div>
                  <div className="bg-[#0F1114] border border-gray-700 rounded-lg p-2.5 col-span-2">
                    <p className="text-gray-500">Deadline</p>
                    <p className="text-[#F59E0B] mt-1">{row.deadline ? new Date(row.deadline).toLocaleString() : "-"}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAssess?.(row.assignmentId)}
                  className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-[#00C2FF]/40 bg-[#00C2FF]/10 text-[#9fdaed] text-sm font-medium hover:bg-[#00C2FF]/20"
                >
                  Evaluation
                </button>
              </div>
            ))}
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-[#0F1114]/95 backdrop-blur px-4 py-3">
            <div className="flex items-center gap-2">
              <select
                value={commandFilter}
                onChange={(e) => setCommandFilter(e.target.value)}
                className="ui-control flex-1 text-xs min-h-10"
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => loadAssignments(batchId, { forceRefresh: true })}
                className="ui-btn ui-btn-secondary text-xs min-h-10 px-3"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignmentList;
