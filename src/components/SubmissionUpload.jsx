import React, { useState } from 'react';
import axios from 'axios';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const SubmissionUpload = ({ assignmentId, contentType = 'STUDENT_SUBMISSION', onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = [
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
    'jpg', 'jpeg', 'png', 'txt', 'md',
    'c', 'cpp', 'cc', 'cxx', 'h', 'hpp',
    'java', 'py', 'js', 'jsx', 'ts', 'tsx',
    'html', 'css', 'sql', 'json', 'xml', 'yaml', 'yml',
    'zip', 'rar', '7z'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setError('');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 50MB limit');
      setFile(null);
      return;
    }

    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(fileExtension)) {
      setError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!assignmentId) {
      setError('Assignment ID is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${BASE_URL}/api/submissions/upload?assignmentId=${assignmentId}&contentType=${contentType}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentComplete = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentComplete);
          },
        }
      );

      setSuccess('File uploaded successfully!');
      setFile(null);
      setUploadProgress(0);
      
      // Reset file input
      document.getElementById(contentType + '-file-input')?.value && 
        (document.getElementById(contentType + '-file-input').value = '');

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to upload file'
      );
    } finally {
      setLoading(false);
    }
  };

  const title = contentType === 'LAB_MANUAL' ? 'Upload Lab Manual' : 'Submit Assignment';
  const description = contentType === 'LAB_MANUAL' 
    ? 'Upload lab manual, reference materials, or resources'
    : 'Upload your assignment submission (docs, code files, archives, etc)';

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition cursor-pointer">
          <input
            id={contentType + '-file-input'}
            type="file"
            onChange={handleFileChange}
            disabled={loading}
            className="w-full cursor-pointer"
            accept={ALLOWED_TYPES.map((ext) => `.${ext}`).join(',')}
          />
          {file && (
            <p className="mt-2 text-sm text-blue-600 font-semibold">
              ✓ Selected: {file.name}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded flex items-start gap-2">
            <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 text-center">{uploadProgress}% uploaded</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
            loading || !file
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? `Uploading (${uploadProgress}%)...` : 'Upload File'}
        </button>
      </form>

      {/* File Info */}
      <p className="text-xs text-gray-500 mt-4">
        Allowed: Documents, images, code files (.cpp, .java, .c, .html, .css, .js, etc), and archives (Max 50MB)
      </p>
    </div>
  );
};

export default SubmissionUpload;
