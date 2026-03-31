import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle, FilePlus2 } from "lucide-react";
import { useBatch } from "../../context/BatchContext";
import { useAssignment } from "../../context/AssignmentContext";

const EMPTY_FORM = {
  batchId: "",
  title: "",
  description: "",
  deadline: "",
  allowMultipleSubmissions: false,
  enableSimilarityDetection: false,
  enableAiDetection: false,
};

const CreateAssignment = ({ onNavigate }) => {
  const { getMyBatches } = useBatch();
  const { createAssignment, loading } = useAssignment();

  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const submitLockRef = useRef(false);
  const deadlineInputRef = useRef(null);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await getMyBatches();
        setBatches(data || []);
      } catch (err) {
        setMessage({ success: false, text: err.message });
      }
    };

    loadBatches();
  }, []);

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.batchId === form.batchId),
    [batches, form.batchId]
  );

  const nowForDateInput = useMemo(() => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        batchId: form.batchId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        deadline: `${form.deadline}T23:59:59`,
        allowMultipleSubmissions: form.allowMultipleSubmissions,
        enableSimilarityDetection: form.enableSimilarityDetection,
        enableAiDetection: form.enableAiDetection,
      };

      await createAssignment(payload);
      setMessage({
        success: true,
        text: "Assignment created successfully.",
      });
      setForm((prev) => ({ ...EMPTY_FORM, batchId: prev.batchId }));
    } catch (err) {
      setMessage({ success: false, text: err.message || "Failed to create assignment." });
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const inputClass = "w-full ui-control";
  const sectionClass = "rounded-xl border border-gray-700 bg-[#14171B] p-4 space-y-3";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#F3F4F6] mb-2">Create Assignment</h2>
        <p className="text-sm text-gray-500">
          Create assignments for your batch with submission and plagiarism settings.
        </p>
      </div>

      <form onSubmit={submit} className="ui-surface p-8 space-y-6">
        <div>
          <label className="block text-sm text-[#F3F4F6] mb-2">Batch</label>
          <select
            value={form.batchId}
            onChange={(e) => setForm((prev) => ({ ...prev, batchId: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Select batch</option>
            {batches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>
                {batch.subjectName} - {batch.yearLabel || `Year ${batch.year}`} - {batch.division} - {batch.baseBatch}
              </option>
            ))}
          </select>
        </div>

        {selectedBatch && (
          <div className="rounded-xl border border-[#00C2FF]/25 bg-[#00C2FF]/5 p-4 text-sm text-gray-300">
            <p className="font-medium text-[#F3F4F6]">Selected Batch</p>
            <p className="mt-1">{selectedBatch.subjectName}</p>
            <p className="text-xs text-gray-400 mt-1">
              {selectedBatch.yearLabel || `Year ${selectedBatch.year}`} - {selectedBatch.division} - {selectedBatch.baseBatch}
            </p>
            <p className="text-xs text-[#9fdaed] mt-2">Students: {selectedBatch.studentCount ?? 0}</p>
          </div>
        )}

        <div>
          <label className="block text-sm text-[#F3F4F6] mb-2">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className={inputClass}
            maxLength={200}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[#F3F4F6] mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className={`${inputClass} min-h-28 resize-y`}
            maxLength={5000}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm text-[#F3F4F6] mb-2">Submission Deadline</label>
          <input
            ref={deadlineInputRef}
            type="date"
            value={form.deadline}
            min={nowForDateInput}
            onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
            className={inputClass}
            required
            style={{ colorScheme: "dark" }}
          />
        </div>

        <div className={sectionClass}>
          <p className="text-sm font-medium text-[#F3F4F6]">Submission Settings</p>
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.allowMultipleSubmissions}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, allowMultipleSubmissions: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-[#00C2FF] focus:ring-[#00C2FF]/30"
            />
            Allow multiple submissions
          </label>
        </div>

        <div className={sectionClass}>
          <p className="text-sm font-medium text-[#F3F4F6]">Plagiarism Detection</p>
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.enableSimilarityDetection}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, enableSimilarityDetection: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-[#00C2FF] focus:ring-[#00C2FF]/30"
            />
            Enable code similarity detection
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.enableAiDetection}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, enableAiDetection: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-[#00C2FF] focus:ring-[#00C2FF]/30"
            />
            Enable AI generated code detection
          </label>
        </div>

        {selectedBatch && (
          <div className="rounded-xl border border-[#00C2FF]/25 bg-[#00C2FF]/5 p-4 text-sm text-gray-300">
            This assignment will be visible to {selectedBatch.studentCount ?? 0} students immediately.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || submitting}
          className="w-full ui-btn ui-btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating Assignment..." : "Create Assignment"}
        </button>

        {typeof onNavigate === "function" && (
          <button
            type="button"
            onClick={() => onNavigate("assignment-list")}
            className="w-full ui-btn ui-btn-secondary"
          >
            View Assignment List
          </button>
        )}
      </form>

      {message && (
        <div
          className={`mt-6 p-5 rounded-xl border flex items-start gap-3 ${
            message.success ? "bg-[#00C2FF]/10 border-[#00C2FF]/30" : "bg-red-950/40 border-red-800"
          }`}
        >
          {message.success ? (
            <CheckCircle size={18} className="text-[#00C2FF] mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-[#F87171] mt-0.5" />
          )}
          <p className={`font-medium text-sm ${message.success ? "text-[#00C2FF]" : "text-[#F87171]"}`}>
            {message.text}
          </p>
        </div>
      )}

      {batches.length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-700 bg-[#1C1F23] p-6 text-sm text-gray-400 flex items-start gap-3">
          <FilePlus2 size={16} className="mt-0.5" />
          <p>Create at least one subject batch first, then assignment creation will be enabled for those batches.</p>
        </div>
      )}
    </div>
  );
};

export default CreateAssignment;
