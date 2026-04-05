import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const VideoPlayer = ({ videoUrl, assignmentId, onComplete }) => {
  const videoRef = useRef(null);
  const completionSentRef = useRef(false); // Use ref to prevent duplicate requests
  const [watched, setWatched] = useState(false);
  const [watchedPercent, setWatchedPercent] = useState(0);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  // Lock seeking behavior and prevent speed changes
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    let lastTime = 0;

    // Prevent seeking
    const handleTimeUpdate = (e) => {
      // Allow small buffer time for seeking
      if (Math.abs(video.currentTime - lastTime) > 2) {
        video.currentTime = lastTime;
      }
      lastTime = video.currentTime;

      // Calculate watched percentage
      if (video.duration > 0) {
        const percent = (video.currentTime / video.duration) * 100;
        setWatchedPercent(Math.min(percent, 100));

        // Mark complete when 95% watched
        if (percent >= 95) {
          markVideoComplete(Math.floor(video.currentTime));
        }
      }
    };

    const handleSeeking = (e) => {
      // Prevent seeking
      e.preventDefault();
      video.currentTime = lastTime;
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Prevent playback rate changes - always reset to 1x
    const handlePlaybackRateChange = (e) => {
      if (video.playbackRate !== 1) {
        video.playbackRate = 1;
      }
    };

    // Disable fullscreen
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeking);
    video.addEventListener('contextmenu', handleContextMenu);
    video.addEventListener('ratechange', handlePlaybackRateChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Ensure playback rate is 1x on mount
    video.playbackRate = 1;

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeking);
      video.removeEventListener('contextmenu', handleContextMenu);
      video.removeEventListener('ratechange', handlePlaybackRateChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [assignmentId]);

  const markVideoComplete = async (watchTimeSeconds) => {
    // Prevent duplicate requests - only send once
    if (completionSentRef.current) return;

    completionSentRef.current = true; // Mark as sent immediately

    try {
      const response = await axios.post(
        `${BASE_URL}/api/assignments/${assignmentId}/video/watch-complete`,
        { watchTimeSeconds },
        { withCredentials: true }
      );

      if (response.data.videoCompleted) {
        setWatched(true);
        setError('');
        if (onComplete) {
          onComplete();
        }
      }
    } catch (err) {
      console.error('Failed to mark video complete', err);
      setError('Failed to record video completion. Please try again.');
      completionSentRef.current = false; // Reset on error to allow retry
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative w-full bg-black rounded-lg overflow-hidden"
        style={{ aspectRatio: '16 / 9' }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          controlsList="nodownload nofullscreen"
          controls
          style={{
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#00C2FF] h-2 rounded-full transition-all duration-300"
            style={{ width: `${watchedPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 text-center">
          Video Progress: {Math.round(watchedPercent)}%
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Completion Message */}
      {watched && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-300">Video Completed!</p>
              <p className="text-sm text-emerald-200 mt-1">
                You have watched the entire video lecture. You can now proceed to submit your assignment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-lg">
        <p className="text-xs text-[#9fdaed]">
          <strong>Note:</strong> You must watch the entire video lecture (at least 95%) before you can submit.
          Video playback is locked to 1x speed, and seeking/skipping is disabled.
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
