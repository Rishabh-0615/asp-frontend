import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, BookOpen } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const LabManualView = ({ assignmentId, batchId, role = 'student', refreshKey = 0 }) => {
  const [labManuals, setLabManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLabManuals();
  }, [assignmentId, batchId, refreshKey]);

  const fetchLabManuals = async () => {
    try {
      setLoading(true);
      if (!assignmentId && !batchId) {
        setLabManuals([]);
        setLoading(false);
        return;
      }

      const requests = [];
      if (assignmentId) {
        requests.push(axios.get(`${BASE_URL}/api/submissions/assignment/${assignmentId}/lab-manuals`, {
          withCredentials: true,
        }));
      }
      if (batchId) {
        requests.push(axios.get(`${BASE_URL}/api/submissions/batch/${batchId}/lab-manuals`, {
          withCredentials: true,
        }));
      }

      const responses = await Promise.all(requests);
      const merged = new Map();

      responses.forEach((response) => {
        const data = response?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : data
              ? [data]
              : [];

        list.forEach((manual) => {
          if (manual?.id) {
            merged.set(manual.id, manual);
          }
        });
      });

      const sorted = [...merged.values()].sort((a, b) => {
        const aTime = a?.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bTime = b?.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bTime - aTime;
      });

      setLabManuals(sorted);
      setError('');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setLabManuals([]);
        setError('');
      } else {
        setLabManuals([]);
        setError(err?.response?.data?.message || 'Failed to fetch lab manuals.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (submissionId) => {
    window.open(`${BASE_URL}/api/submissions/lab-manuals/${submissionId}/download`, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: undefined
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (labManuals.length === 0) {
    return (
      <div className="p-6 bg-[#1C1F23] rounded-2xl border border-gray-700 text-center">
        <p className="text-gray-500 text-sm">{error || 'No lab manual uploaded yet.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-[#00C2FF]" />
        <h4 className="font-semibold text-[#F3F4F6] text-lg">Lab Manual & Resources</h4>
      </div>

      <div className="grid gap-4">
        {labManuals.map((manual) => (
          <div
            key={manual.id}
            className="p-5 border border-gray-700 rounded-2xl bg-[#1C1F23] hover:border-[#00C2FF]/40 hover:bg-[#2A2F36] transition-all duration-200 group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <a
                  href={manual.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F3F4F6] group-hover:text-[#00C2FF] font-semibold text-base block truncate transition-colors"
                  title={manual.fileName}
                >
                  {manual.fileName}
                </a>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="bg-[#0F1114] px-2 py-1 rounded-md border border-gray-800">{formatFileSize(manual.fileSize)}</span>
                  <span>•</span>
                  <span className="bg-[#0F1114] px-2 py-1 rounded-md border border-gray-800 uppercase">{manual.fileType || "File"}</span>
                  <span>•</span>
                  <span>{formatDate(manual.submittedAt)}</span>
                </div>
              </div>

              <button
                onClick={() => handleDownload(manual.id)}
                className="ui-btn ui-btn-accent px-4 py-2 text-xs font-semibold shrink-0"
                title="Download lab manual"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabManualView;
