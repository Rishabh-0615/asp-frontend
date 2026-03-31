import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { FileUp, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const StudentBulkUpload = () => {
  const { loading } = useAdmin();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${BASE_URL}/faculty/admin/students/bulk-upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;

      if (data?.success) {
        setResult({
          success: true,
          message: data.message,
          created: data.data?.created || 0,
          skipped: data.data?.skipped || 0,
        });
        setFile(null);
      } else {
        setResult({ success: false, message: data.message || "Upload failed" });
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Network error occurred";
      setResult({ success: false, message });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "rollNo,email,name,department,year,division,baseBatch,tempPassword\nCS001,john@example.com,John Doe,COMPS,2,A,COMPS_A,TempPass123!\nCS002,jane@example.com,Jane Smith,IT,3,B,IT_B,SecurePass456!";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#F3F4F6] mb-2">
          Bulk Upload Students
        </h2>
        <p className="text-sm text-gray-500">
          Upload a CSV file to create multiple student accounts at once
        </p>
      </div>

      {/* CSV Format Info */}
      <div className="bg-[#00C2FF]/5 border border-[#00C2FF]/20 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-[#F3F4F6] mb-3">CSV Format Requirements</h3>
        <div className="bg-[#0F1114] rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <div className="text-gray-400">
            rollNo,email,name,department,year,division,baseBatch,tempPassword
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          <p className="mb-1">Example:</p>
          <code className="text-xs bg-[#0F1114] px-2 py-1 rounded text-gray-400">
            CS001,john@example.com,John Doe,COMPS,2,A,COMPS_A,TempPass123!
          </code>
        </div>
        <button
          onClick={downloadTemplate}
          className="mt-4 text-sm text-[#00C2FF] hover:underline"
        >
          Download Template CSV
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-[#1C1F23] border border-gray-700 rounded-xl p-8">
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-[#00C2FF]/40 transition-colors">
          <FileUp size={48} className="mx-auto mb-4 text-gray-600" />

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-sm text-gray-500">
              {file ? (
                <span className="text-[#F3F4F6] font-medium">{file.name}</span>
              ) : (
                <>
                  Click to select CSV file or drag and drop
                  <br />
                  <span className="text-xs">(CSV files only)</span>
                </>
              )}
            </span>
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading || loading}
          className="
            w-full mt-6 px-6 py-3 rounded-xl font-medium text-sm
            bg-[#00C2FF] text-[#0E0F11]
            hover:bg-[#0099CC]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
          "
        >
          {uploading ? "Uploading..." : "Upload Students"}
        </button>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`
            mt-6 p-5 rounded-xl border
            ${result.success
              ? "bg-[#00C2FF]/10 border-[#00C2FF]/30"
              : "bg-red-950/40 border-red-800"
            }
          `}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle size={18} className="text-[#00C2FF] mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-[#F87171] mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-semibold text-sm ${result.success ? "text-[#00C2FF]" : "text-[#F87171]"}`}>
                {result.message}
              </p>
              {result.success && (
                <div className="mt-2 text-sm text-gray-400">
                  <p>✓ Students created: {result.created}</p>
                  {result.skipped > 0 && (
                    <p>⚠ Students skipped (duplicates): {result.skipped}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBulkUpload;
