import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, FilePlus2, Upload, Loader } from "lucide-react";
import { useBatch } from "../../context/BatchContext";
import { useAssignment } from "../../context/AssignmentContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const ALLOWED_VIDEO_TYPES = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv", "wmv", "m4v"];
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

const EMPTY_FORM = {
  batchId: "",
  title: "",
  description: "",
  deadline: "",
  allowMultipleSubmissions: false,
  enableSimilarityDetection: false,
  enableAiDetection: false,
  videoFile: null,
};

const CreateAssignment = ({ onNavigate }) => {
  const { getMyBatches } = useBatch();
  const { createAssignment, loading } = useAssignment();

  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [message, setMessage] = useState(null);
  const [createdAssignmentId, setCreatedAssignmentId] = useState(null);
  const submitLockRef = useRef(false);
  const videoInputRef = useRef(null);
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
    setCreatedAssignmentId(null);

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

      const createResponse = await createAssignment(payload);

      // Extract assignment ID from nested response structure
      // Response structure: { success: true, message: "...", data: { assignmentId: "uuid", ... } }
      const assignmentId = createResponse?.data?.assignmentId ||
                          createResponse?.assignmentId ||
                          createResponse?.id;

      if (!assignmentId) {
        console.error("Response structure:", createResponse);
        throw new Error("Assignment created but ID not returned from server");
      }

      setCreatedAssignmentId(assignmentId);

      // Upload video if provided
      if (form.videoFile) {
        setUploadingVideo(true);
        try {
          const videoFormData = new FormData();
          videoFormData.append("file", form.videoFile);

          await axios.post(
            `${BASE_URL}/faculty/assignments/${assignmentId}/video/upload`,
            videoFormData,
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setMessage({
            success: true,
            text: "✓ Assignment created and video uploaded successfully!",
          });
        } catch (videoErr) {
          // Video upload failed, but assignment created
          setMessage({
            success: true,
            text: `Assignment created. Video upload failed: ${videoErr.response?.data?.message || videoErr.message}. You can upload video later from assignment list.`,
          });
        } finally {
          setUploadingVideo(false);
        }
      } else {
        setMessage({
          success: true,
          text: "✓ Assignment created successfully! (No video added)",
        });
      }

      // Reset form
      setForm((prev) => ({ ...EMPTY_FORM, batchId: prev.batchId }));
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (err) {
      setMessage({ success: false, text: err.message || "Failed to create assignment." });
    } finally {
      setSubmitting(false);
      setUploadingVideo(false);
      submitLockRef.current = false;
    }
  };

  const handleVideoSelect = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) {
      setForm((prev) => ({ ...prev, videoFile: null }));
      return;
    }

    // Validate video format
    const ext = uploadedFile.name.split(".").pop().toLowerCase();
    if (!ALLOWED_VIDEO_TYPES.includes(ext)) {
      setMessage({
        success: false,
        text: `Invalid video format. Allowed: ${ALLOWED_VIDEO_TYPES.join(", ")}`,
      });
      e.target.value = "";
      return;
    }

    // Validate video size
    if (uploadedFile.size > MAX_VIDEO_SIZE) {
      setMessage({
        success: false,
        text: "Video file exceeds 500MB limit",
      });
      e.target.value = "";
      return;
    }

    setForm((prev) => ({ ...prev, videoFile: uploadedFile }));
    setMessage(null);
  };

  const clearVideo = () => {
    setForm((prev) => ({ ...prev, videoFile: null }));
    if (videoInputRef.current) videoInputRef.current.value = "";
    setMessage(null);
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

        {/* VIDEO UPLOAD SECTION */}
        <div className={sectionClass}>
          <p className="text-sm font-medium text-[#F3F4F6] flex items-center gap-2">
            <span>📹 Video Lecture (Optional)</span>
            <span className="text-xs bg-[#00C2FF]/20 text-[#00C2FF] px-2 py-0.5 rounded">Optional</span>
          </p>
          <p className="text-xs text-gray-400">
            Students must watch this video completely before they can submit the assignment.
          </p>

          {!form.videoFile ? (
            <div className="rounded-lg border-2 border-dashed border-gray-700 bg-[#0F1114] p-6 text-center hover:border-gray-600 transition">
              <Upload size={24} className="mx-auto text-gray-500 mb-2" />
              <p className="text-sm text-gray-400">Drag video or click to select</p>
              <p className="text-xs text-gray-600 mt-1">Format: MP4, WebM, OGG, MOV, AVI, MKV (Max 500MB)</p>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={submitting || uploadingVideo}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#00C2FF]/20 text-[#00C2FF] text-xs font-medium hover:bg-[#00C2FF]/30 transition disabled:opacity-50"
              >
                Select Video
              </button>
              <input
                ref={videoInputRef}
                type="file"
                className="hidden"
                accept={ALLOWED_VIDEO_TYPES.map((ext) => `.${ext}`).join(",")}
                onChange={handleVideoSelect}
                disabled={submitting || uploadingVideo}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-gray-700 bg-[#0F1114] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase">Selected Video</p>
                  <p className="text-sm text-[#F3F4F6] mt-1 break-all">{form.videoFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(form.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearVideo}
                  disabled={submitting || uploadingVideo}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
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
          disabled={loading || submitting || uploadingVideo}
          className="w-full ui-btn ui-btn-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploadingVideo && <Loader size={16} className="animate-spin" />}
          {submitting ? "Creating & Uploading..." : uploadingVideo ? "Uploading Video..." : "Create Assignment"}
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
