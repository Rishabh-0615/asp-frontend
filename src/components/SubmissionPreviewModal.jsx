import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, X } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TEXT_PREVIEW_EXTENSIONS = new Set([
  "txt", "md", "json", "xml", "yaml", "yml", "sql",
  "c", "cpp", "cc", "cxx", "h", "hpp", "java", "py",
  "js", "jsx", "ts", "tsx", "html", "css"
]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"]);

const submissionPreviewCache = new Map();

const getExtension = (fileName = "") => {
  const index = fileName.lastIndexOf(".");
  return index > -1 ? fileName.slice(index + 1).toLowerCase() : "";
};

const getSubmissionKey = (submission) => {
  if (!submission) {
    return "";
  }

  if (submission.id) {
    return `id:${submission.id}`;
  }

  return `url:${submission.fileUrl || ""}|name:${submission.fileName || ""}`;
};

const getPreviewUrl = (submissionId, fileUrl, fileName) => {
  if (submissionId) {
    return `${BASE_URL}/api/submissions/${submissionId}/preview`;
  }

  const params = new URLSearchParams({
    fileUrl: fileUrl || "",
    fileName: fileName || "submission",
  });

  return `${BASE_URL}/api/submissions/file/preview?${params.toString()}`;
};

const getDownloadUrl = (submissionId, fileUrl, fileName) => {
  if (submissionId) {
    return `${BASE_URL}/api/submissions/${submissionId}/download`;
  }

  const params = new URLSearchParams({
    fileUrl: fileUrl || "",
    fileName: fileName || "submission",
  });

  return `${BASE_URL}/api/submissions/file/download?${params.toString()}`;
};

const getPreviewKind = (fileName = "") => {
  const extension = getExtension(fileName);
  if (extension === "pdf") {
    return "pdf";
  }
  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }
  if (TEXT_PREVIEW_EXTENSIONS.has(extension)) {
    return "text";
  }
  return "unsupported";
};

const fetchSubmissionPreviewAsset = async (submission) => {
  if (!submission) {
    throw new Error("Submission not found");
  }

  const cacheKey = getSubmissionKey(submission);
  if (!cacheKey) {
    throw new Error("Submission cache key missing");
  }

  const cached = submissionPreviewCache.get(cacheKey);
  if (cached?.status === "ready") {
    return cached;
  }
  if (cached?.status === "pending") {
    return cached.promise;
  }

  const previewKind = getPreviewKind(submission.fileName);
  const previewUrl = getPreviewUrl(submission.id, submission.fileUrl, submission.fileName);

  const promise = (async () => {
    try {
      if (previewKind === "text") {
        const response = await fetch(previewUrl, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Unable to load text preview.");
        }

        const text = await response.text();
        const entry = { status: "ready", previewKind, text, previewUrl, cacheKey };
        submissionPreviewCache.set(cacheKey, entry);
        return entry;
      }

      if (previewKind === "pdf" || previewKind === "image") {
        const response = await fetch(previewUrl, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Unable to load file preview.");
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const entry = { status: "ready", previewKind, blob, blobUrl, previewUrl, cacheKey };
        submissionPreviewCache.set(cacheKey, entry);
        return entry;
      }

      const entry = { status: "ready", previewKind: "unsupported", previewUrl, cacheKey };
      submissionPreviewCache.set(cacheKey, entry);
      return entry;
    } catch (error) {
      submissionPreviewCache.delete(cacheKey);
      throw error;
    }
  })();

  const pendingEntry = { status: "pending", promise };
  submissionPreviewCache.set(cacheKey, pendingEntry);
  return promise;
};

export const prefetchSubmissionPreview = (submission) => {
  if (!submission) {
    return null;
  }

  const previewKind = getPreviewKind(submission.fileName);
  if (previewKind === "unsupported") {
    return null;
  }

  return fetchSubmissionPreviewAsset(submission).catch(() => null);
};

export const clearSubmissionPreviewCache = (submission) => {
  const key = getSubmissionKey(submission);
  if (!key) {
    return;
  }

  const cached = submissionPreviewCache.get(key);
  if (cached?.blobUrl) {
    URL.revokeObjectURL(cached.blobUrl);
  }

  submissionPreviewCache.delete(key);
};

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

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) {
    return "-";
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / Math.pow(1024, unitIndex)) * 100) / 100} ${units[unitIndex]}`;
};

const SubmissionPreviewModal = ({ isOpen, onClose, submission }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewKind, setPreviewKind] = useState("none");
  const [textPreview, setTextPreview] = useState("");
  const [previewBlobUrl, setPreviewBlobUrl] = useState("");

  const fileName = submission?.fileName || "Uploaded file";
  const fileKey = useMemo(() => getSubmissionKey(submission), [submission]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isOpen || !submission) {
        return;
      }

      setLoading(true);
      setError("");
      setPreviewKind("none");
      setTextPreview("");
      setPreviewBlobUrl("");

      try {
        const result = await fetchSubmissionPreviewAsset(submission);
        if (cancelled) {
          return;
        }

        if (result.previewKind === "text") {
          setPreviewKind("text");
          setTextPreview(result.text || "");
          return;
        }

        if (result.previewKind === "pdf" || result.previewKind === "image") {
          setPreviewKind(result.previewKind);
          setPreviewBlobUrl(result.blobUrl || "");
          return;
        }

        setPreviewKind("unsupported");
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to preview uploaded file.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen, submission, fileKey]);

  if (!isOpen) {
    return null;
  }

  const downloadHref = previewBlobUrl || getDownloadUrl(submission?.id, submission?.fileUrl, submission?.fileName);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-auto bg-[#111317] border border-gray-700 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div>
            <p className="text-lg font-semibold text-[#F3F4F6]">Uploaded Submission Preview</p>
            <p className="text-xs text-gray-400 mt-1 break-all">{fileName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-700 bg-[#1C1F23] text-gray-300 hover:text-[#F3F4F6] hover:bg-gray-700 transition-colors"
            aria-label="Close uploaded preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr] gap-5">
          <div className="rounded-xl border border-gray-700 bg-[#0F1114] min-h-90 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Eye size={14} />
              Preview
            </div>

            {loading && (
              <div className="h-80 flex items-center justify-center text-gray-500 text-sm">
                Loading uploaded preview...
              </div>
            )}

            {!loading && error && (
              <div className="h-80 flex items-center justify-center text-center px-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && previewKind === "pdf" && previewBlobUrl && (
              <div className="h-80 overflow-auto rounded-lg bg-white p-2">
                <iframe
                  src={previewBlobUrl}
                  title="Uploaded PDF Preview"
                  className="w-full h-full border-0 rounded-lg bg-white"
                />
              </div>
            )}

            {!loading && !error && previewKind === "image" && previewBlobUrl && (
              <div className="h-80 overflow-auto rounded-lg bg-black/20 p-2 flex items-center justify-center">
                <img
                  src={previewBlobUrl}
                  alt="Uploaded preview"
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>
            )}

            {!loading && !error && previewKind === "text" && (
              <pre className="h-80 overflow-auto rounded-lg border border-gray-800 bg-[#0B0D10] p-3 text-xs text-gray-200 whitespace-pre-wrap">
                {textPreview || "(Empty file)"}
              </pre>
            )}

            {!loading && !error && previewKind === "unsupported" && (
              <div className="h-80 flex flex-col items-center justify-center text-center px-4">
                <FileText size={20} className="text-gray-500" />
                <p className="text-sm text-gray-300 mt-2">Preview not available for this file type.</p>
                <p className="text-xs text-gray-500 mt-1">You can still download the uploaded file.</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Submission Status</p>
              <p className="mt-1 text-sm font-semibold text-emerald-300">Uploaded</p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">File Details</p>
              <div className="mt-2 space-y-2 text-sm text-gray-300">
                <p className="break-all">Name: {submission?.fileName || "-"}</p>
                <p>Size: {formatFileSize(submission?.fileSize)}</p>
                <p>Type: {submission?.fileType || "-"}</p>
                <p>Submitted: {formatDateTime(submission?.submittedAt)}</p>
                {submission?.status && <p>Status: {submission.status}</p>}
              </div>
            </div>
            <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4 text-xs text-gray-400">
              This preview is loaded from the saved submission, so the student can review exactly what was uploaded.
            </div>
            <a
              href={downloadHref}
              download={fileName}
              className="ui-btn ui-btn-secondary w-full disabled:opacity-50"
            >
              <Download size={14} />
              Download
            </a>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-700 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="ui-btn ui-btn-accent min-h-9 px-3 py-1.5 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPreviewModal;
