import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, AlertCircle, Loader, Calendar, CheckCircle2, Lock, Info, Video } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import SubmissionUpload from '../components/SubmissionUpload';
import LabManualView from '../components/LabManualView';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const AssignmentDetails = ({ assignmentId, onBack }) => {
  const [assignment, setAssignment] = useState(null);
  const [videoProgress, setVideoProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAssignmentDetails();
    checkVideoProgress();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/assignments/${assignmentId}/details`,
        { withCredentials: true }
      );
      setAssignment(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignment details');
      console.error('Error loading assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkVideoProgress = async () => {
    try {
      setVideoLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/assignments/${assignmentId}/video/progress`,
        { withCredentials: true }
      );
      setVideoProgress(response.data);
    } catch (err) {
      console.error('Error loading video progress:', err);
      setVideoProgress({ videoCompleted: false });
    } finally {
      setVideoLoading(false);
    }
  };

  const handleVideoComplete = () => {
    setVideoProgress((prev) => ({ ...prev, videoCompleted: true }));
  };

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isDeadlinePassed = assignment && new Date(assignment.deadline) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1114] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-6 w-6 text-[#00C2FF] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-[#0F1114] p-6">
        <button
          onClick={() => onBack?.()}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#F3F4F6] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="bg-[#1C2128] rounded-xl border border-red-500/20 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = !assignment?.requiresVideoViewing || videoProgress?.videoCompleted;
  const isAssignmentClosed = assignment?.closed || isDeadlinePassed;

  return (
    <div className="min-h-screen bg-[#0F1114]">
      {/* Top nav strip */}
      <div className="border-b border-[#2D3748] bg-[#1C2128] px-6 py-4">
        <button
          onClick={() => onBack?.()}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#F3F4F6] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">

        {/* Title + meta */}
        <div className="bg-[#1C2128] rounded-xl border border-[#2D3748] p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-xl font-semibold text-[#F3F4F6] leading-snug">
              {assignment?.title}
            </h1>
            <span
              className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
                isAssignmentClosed
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-[#00C2FF]/10 text-[#00C2FF] border-[#00C2FF]/20'
              }`}
            >
              {isAssignmentClosed ? 'Closed' : 'Open'}
            </span>
          </div>

          {assignment?.description && (
            <p className="text-sm text-[#6B7280] leading-relaxed mb-5">
              {assignment.description}
            </p>
          )}

          <div className="flex flex-wrap gap-5 pt-4 border-t border-[#2D3748]">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-[#6B7280]" />
              <span className="text-[#6B7280]">Deadline:</span>
              <span className={`font-medium ${isDeadlinePassed ? 'text-red-400' : 'text-[#F3F4F6]'}`}>
                {formatDate(assignment?.deadline)}
              </span>
            </div>
            {assignment?.requiresVideoViewing && (
              <div className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4 text-[#6B7280]" />
                <span className="text-[#6B7280]">Video required</span>
                {videoProgress?.videoCompleted && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Done
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lab Manual */}
        <LabManualView
          assignmentId={assignmentId}
          batchId={assignment?.batchId}
          refreshKey={refreshKey}
        />

        {/* Video */}
        {assignment?.videoUrl && (
          <div className="bg-[#1C2128] rounded-xl border border-[#2D3748] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2D3748] flex items-center gap-2">
              <Video className="h-4 w-4 text-[#6B7280]" />
              <span className="text-sm font-semibold text-[#F3F4F6]">Video Lecture</span>
              {videoProgress?.videoCompleted && (
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Watched
                </span>
              )}
            </div>
            <div className="p-6">
              {videoLoading ? (
                <div className="flex justify-center py-10">
                  <Loader className="h-5 w-5 text-[#00C2FF] animate-spin" />
                </div>
              ) : (
                <VideoPlayer
                  videoUrl={assignment.videoUrl}
                  assignmentId={assignmentId}
                  onComplete={handleVideoComplete}
                />
              )}
            </div>
          </div>
        )}

        {/* Submission */}
        {!isAssignmentClosed ? (
          <div className="bg-[#1C2128] rounded-xl border border-[#2D3748] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2D3748] flex items-center gap-2">
              {canSubmit
                ? <CheckCircle2 className="h-4 w-4 text-[#6B7280]" />
                : <Lock className="h-4 w-4 text-[#6B7280]" />
              }
              <span className="text-sm font-semibold text-[#F3F4F6]">
                {canSubmit ? 'Submit Assignment' : 'Submission Locked'}
              </span>
            </div>
            <div className="p-6">
              {!canSubmit ? (
                <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-lg p-4">
                  <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">Watch the video first</p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Complete the video lecture above before submitting.
                      {videoProgress?.watchTimeSeconds
                        ? ` ${Math.round(videoProgress.watchTimeSeconds)}s watched so far.`
                        : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <SubmissionUpload
                  assignmentId={assignmentId}
                  contentType="STUDENT_SUBMISSION"
                  onUploadSuccess={handleUploadSuccess}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#1C2128] rounded-xl border border-red-500/20 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-300">Submissions closed</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  This assignment is no longer accepting submissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-[#1C2128] rounded-xl border border-[#2D3748] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-[#6B7280]" />
            <span className="text-sm font-medium text-[#F3F4F6]">Submission guidelines</span>
          </div>
          <ul className="space-y-2">
            {assignment?.requiresVideoViewing && (
              <li className="text-xs text-[#6B7280] flex gap-2">
                <span className="text-[#4B5563]">–</span>
                Complete the video lecture before submitting
              </li>
            )}
            <li className="text-xs text-[#6B7280] flex gap-2">
              <span className="text-[#4B5563]">–</span>
              Maximum file size: 2 MB
            </li>
            <li className="text-xs text-[#6B7280] flex gap-2">
              <span className="text-[#4B5563]">–</span>
              Accepted formats: PDF, Word, Excel, code files, archives, images
            </li>
            {assignment?.allowMultipleSubmissions && (
              <li className="text-xs text-[#6B7280] flex gap-2">
                <span className="text-[#4B5563]">–</span>
                Multiple submissions allowed before the deadline
              </li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AssignmentDetails;