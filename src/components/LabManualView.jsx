import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, BookOpen } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const LabManualView = ({ assignmentId, role = 'student', refreshKey = 0 }) => {
  const [labManuals, setLabManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLabManuals();
  }, [assignmentId, refreshKey]);

  const fetchLabManuals = async () => {
    try {
      setLoading(true);
      const endpoint = `${BASE_URL}/api/submissions/assignment/${assignmentId}/lab-manuals`;
      const response = await axios.get(endpoint);
      setLabManuals(Array.isArray(response.data) ? response.data : [response.data]);
      setError('');
    } catch (err) {
      // Lab manuals might not exist yet - this is OK
      setLabManuals([]);
      setError('');
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
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-sm">No lab manuals available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-5 w-5 text-purple-600" />
        <h4 className="font-semibold text-gray-800">Lab Manuals & Resources</h4>
      </div>

      {labManuals.map((manual) => (
        <div
          key={manual.id}
          className="p-4 border border-purple-200 rounded-lg bg-purple-50 hover:shadow-sm transition"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <a
                href={manual.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 hover:text-purple-900 font-semibold text-sm wrap-break-word hover:underline"
                title={manual.fileName}
              >
                {manual.fileName}
              </a>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span>Size: {formatFileSize(manual.fileSize)}</span>
                <span>•</span>
                <span>Type: {manual.fileType}</span>
                <span>•</span>
                <span>Updated: {formatDate(manual.submittedAt)}</span>
              </div>
            </div>

            <button
              onClick={() => handleDownload(manual.id)}
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-semibold transition whitespace-nowrap shrink-0"
              title="Download lab manual"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LabManualView;
