import { useEffect, useMemo, useRef, useState } from "react";
import { CircleX, Eye, FileText, Upload, X } from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const TEXT_PREVIEW_EXTENSIONS = new Set([
  "txt", "md", "json", "xml", "yaml", "yml", "sql",
  "c", "cpp", "cc", "cxx", "h", "hpp", "java", "py",
  "js", "jsx", "ts", "tsx", "html", "css"
]);

const imageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp", "image/svg+xml"];

const getExtension = (fileName = "") => {
  const idx = fileName.lastIndexOf(".");
  return idx > -1 ? fileName.slice(idx + 1).toLowerCase() : "";
};

const AssignmentUploadModal = ({
  isOpen,
  onClose,
  assignment,
  allowedTypes,
  uploading,
  onSubmit,
  onSubmitted,
}) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [previewType, setPreviewType] = useState("none");
  const [previewUrl, setPreviewUrl] = useState("");
  const [textPreview, setTextPreview] = useState("");

  const allowListText = useMemo(() => allowedTypes.map((ext) => `.${ext}`).join(", "), [allowedTypes]);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setError("");
      setPreviewType("none");
      setTextPreview("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
    }
  }, [isOpen, previewUrl]);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const buildPreview = async (selectedFile) => {
    const ext = getExtension(selectedFile.name);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    if (selectedFile.type === "application/pdf" || ext === "pdf") {
      setPreviewType("pdf");
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setTextPreview("");
      return;
    }

    if (imageTypes.includes(selectedFile.type) || ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(ext)) {
      setPreviewType("image");
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setTextPreview("");
      return;
    }

    if (TEXT_PREVIEW_EXTENSIONS.has(ext)) {
      setPreviewType("text");
      const raw = await selectedFile.text();
      setTextPreview(raw.slice(0, 20000));
      return;
    }

    setPreviewType("unsupported");
    setTextPreview("");
  };

  const clearSelectedFile = () => {
    setFile(null);
    setError("");
    setPreviewType("none");
    setTextPreview("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleSelectFile = async (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    const ext = getExtension(selectedFile.name);
    if (!allowedTypes.includes(ext)) {
      setError(`Invalid file type. Allowed: ${allowListText}`);
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 2MB limit");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
    await buildPreview(selectedFile);
  };

  const handleFileInputChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    await handleSelectFile(selectedFile);
    event.target.value = "";
  };

  const handleSubmit = async () => {
    if (!file || uploading) {
      return;
    }

    const result = await onSubmit(file);
    if (result) {
      if (typeof onSubmitted === "function") {
        onSubmitted(result);
      }
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-auto bg-[#111317] border border-gray-700 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div>
            <p className="text-lg font-semibold text-[#F3F4F6]">Upload Assignment</p>
            <p className="text-xs text-gray-400 mt-1">{assignment?.title || "Selected assignment"}</p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-700 bg-[#1C1F23] text-gray-300 hover:text-[#F3F4F6] hover:bg-gray-700 disabled:opacity-40"
            aria-label="Close upload dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div className="rounded-xl border border-dashed border-gray-600 bg-[#0F1114] p-6 text-center">
              <Upload size={22} className="mx-auto text-[#00C2FF]" />
              <p className="text-sm text-[#F3F4F6] mt-3">Select a file to upload</p>
              <p className="text-xs text-gray-500 mt-1">Upload starts only when you click Submit.</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="mt-4 ui-btn ui-btn-accent min-h-9 px-3 py-1.5 text-xs"
              >
                Select File
              </button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={allowedTypes.map((ext) => `.${ext}`).join(",")}
                onChange={handleFileInputChange}
              />
            </div>

            <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-3 text-xs text-gray-400">
              Allowed: {allowListText}
              <br />
              Max size: 2MB
            </div>

            {file && (
              <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Selected file</p>
                    <p className="text-sm text-[#F3F4F6] mt-1 break-all">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:text-[#F3F4F6] hover:bg-[#2A2F36]"
                    aria-label="Remove selected file"
                    title="Remove selected file"
                  >
                    <CircleX size={16} />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-300">{error}</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-700 bg-[#0F1114] min-h-90 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Eye size={14} />
              Preview
            </div>

            {!file && (
              <div className="h-80 flex items-center justify-center text-gray-500 text-sm">
                Select a file to preview.
              </div>
            )}

            {file && previewType === "pdf" && previewUrl && (
              <div className="h-80 overflow-auto rounded-lg bg-white p-2">
                <iframe
                  src={previewUrl}
                  title="Selected PDF Preview"
                  className="w-full h-full border-0 rounded-lg bg-white"
                />
              </div>
            )}

            {file && previewType === "image" && previewUrl && (
              <div className="h-80 overflow-auto rounded-lg bg-black/20 p-2 flex items-center justify-center">
                <img src={previewUrl} alt="Selected preview" className="max-h-full max-w-full object-contain rounded" />
              </div>
            )}

            {file && previewType === "text" && (
              <pre className="h-80 overflow-auto rounded-lg border border-gray-800 bg-[#0B0D10] p-3 text-xs text-gray-200">
                {textPreview || "(Empty file)"}
              </pre>
            )}

            {file && previewType === "unsupported" && (
              <div className="h-80 flex flex-col items-center justify-center text-center px-4">
                <FileText size={20} className="text-gray-500" />
                <p className="text-sm text-gray-300 mt-2">Preview not available for this file type.</p>
                <p className="text-xs text-gray-500 mt-1">You can still submit this file.</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-700 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="ui-btn ui-btn-secondary min-h-9 px-3 py-1.5 text-xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="ui-btn ui-btn-accent min-h-9 px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentUploadModal;
