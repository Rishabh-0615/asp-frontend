import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Trash2, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const SubmissionView = ({ assignmentId, studentId, role = 'student', contentType = 'STUDENT_SUBMISSION' }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId, studentId, contentType]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let endpoint;

      if (role === 'faculty' || role === 'admin') {
        // Faculty/Admin sees all submissions
        endpoint = `http://localhost:8080/api/submissions/assignment/${assignmentId}`;
        if (contentType) {
          endpoint += `?contentType=${contentType}`;
        }
      } else if (studentId) {
        // Student sees their specific submission
        endpoint = `http://localhost:8080/api/submissions/assignment/${assignmentId}/student/${studentId}`;
      } else {
        // Student sees all their submissions
        endpoint = `http://localhost:8080/api/submissions/my-submissions`;
      }

      const response = await axios.get(endpoint);
      setSubmissions(Array.isArray(response.data) ? response.data : [response.data]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (submissionId) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      setDeletingId(submissionId);
      await axios.delete(`http://localhost:8080/api/submissions/${submissionId}`);
      setSubmissions(submissions.filter(s => s.id !== submissionId));
      alert('Submission deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete submission');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      SUBMITTED: 'bg-blue-100 text-blue-800',
      RECEIVED: 'bg-purple-100 text-purple-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      GRADED: 'bg-green-100 text-green-800',
      RESUBMIT_REQUESTED: 'bg-orange-100 text-orange-800',
      PLAGIARISM_FLAG: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded flex items-start gap-2">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <p className="text-gray-600">
          {contentType === 'LAB_MANUAL' ? 'No lab manuals available' : 'No submissions yet'}
        </p>
      </div>
    );
  }

  const title = role === 'faculty' || role === 'admin' 
    ? (contentType === 'LAB_MANUAL' ? 'Lab Manuals' : 'All Submissions')
    : (contentType === 'LAB_MANUAL' ? 'Lab Manuals' : 'Your Submissions');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="p-5 border border-gray-300 rounded-lg hover:shadow-md transition bg-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: File Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold truncate"
                  title={submission.fileName}
                >
                  {submission.fileName}
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Size: {formatFileSize(submission.fileSize)} • Type: {submission.fileType}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-4 w-4 flex-shrink-0" />
                {formatDate(submission.submittedAt)}
              </div>
              {submission.isLate && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Late by {submission.lateHours} hours
                </p>
              )}
            </div>

            {/* Right: Status & Actions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </span>
                {submission.status === 'GRADED' && (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    Graded
                  </span>
                )}
              </div>

              {submission.marksObtained !== null && (
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-sm font-semibold text-green-800">
                    Marks: {submission.marksObtained}
                  </p>
                </div>
              )}

              {submission.feedback && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Feedback:</p>
                  <p className="text-xs text-blue-700">{submission.feedback}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleDownload(submission.fileUrl, submission.fileName)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold transition"
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>

                {((role === 'student' && contentType === 'STUDENT_SUBMISSION') || (role === 'faculty' && contentType === 'LAB_MANUAL')) && (
                  <button
                    onClick={() => handleDelete(submission.id)}
                    disabled={deletingId === submission.id}
                    className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold transition disabled:opacity-50"
                    title="Delete submission"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === submission.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubmissionView;
