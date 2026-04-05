import React, { useRef, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Upload, X, Loader } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ALLOWED_VIDEO_TYPES = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v'];
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

const VideoUploadModal = ({ isOpen, onClose, assignmentId, onUploadSuccess }) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState('');

  const getExtension = (fileName = '') => {
    const idx = fileName.lastIndexOf('.');
    return idx > -1 ? fileName.slice(idx + 1).toLowerCase() : '';
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    const ext = getExtension(selectedFile.name);
    if (!ALLOWED_VIDEO_TYPES.includes(ext)) {
      setError(`Invalid video format. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`);
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_VIDEO_SIZE) {
      setError('Video file size exceeds 500MB limit');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    handleFileSelect(selectedFile);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!file || uploading || !assignmentId) {
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${BASE_URL}/faculty/assignments/${assignmentId}/video/upload`,
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

      setSuccess('Video uploaded successfully!');
      setFile(null);
      setUploadProgress(0);

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to upload video'
      );
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#111317] border border-gray-700 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div>
            <p className="text-lg font-semibold text-[#F3F4F6]">Upload Video Lecture</p>
            <p className="text-xs text-gray-400 mt-1">Students must watch this video before submitting</p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-700 bg-[#1C1F23] text-gray-300 hover:text-[#F3F4F6] hover:bg-gray-700 disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* File Input */}
          <div className="rounded-xl border border-dashed border-gray-600 bg-[#0F1114] p-6 text-center">
            <Upload size={24} className="mx-auto text-[#00C2FF] mb-3" />
            <p className="text-sm text-[#F3F4F6]">Select a video file to upload</p>
            <p className="text-xs text-gray-500 mt-1">Formats: MP4, WebM, OGG, MOV, AVI, MKV (Max 500MB)</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="mt-4 ui-btn ui-btn-accent min-h-9 px-3 py-1.5 text-xs"
            >
              Choose File
            </button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ALLOWED_VIDEO_TYPES.map((ext) => `.${ext}`).join(',')}
              onChange={handleFileInputChange}
              disabled={uploading}
            />
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Selected file</p>
              <p className="text-sm text-[#F3F4F6] mt-1 break-all">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          )}

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
        </div>

        {/* Footer */}
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
            className="ui-btn ui-btn-accent min-h-9 px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Video'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
