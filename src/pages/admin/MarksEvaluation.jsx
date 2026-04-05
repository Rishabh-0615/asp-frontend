import React, { useState, useEffect } from 'react';
import { ChevronLeft, Download, Eye, CheckCircle, Clock } from 'lucide-react';
import { useAssignment } from '../../context/AssignmentContext';

const MarksEvaluation = ({ assignmentId, onBack }) => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedMarks, setEditedMarks] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { getMarksForAssignment, finalizeMarks } = useAssignment();

  useEffect(() => {
    const loadMarks = async () => {
      if (!assignmentId) return;
      try {
        setLoading(true);
        const data = await getMarksForAssignment(assignmentId);
        setMarks(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        console.error('Error loading marks:', err);
        setError(err.message || 'Failed to load marks');
      } finally {
        setLoading(false);
      }
    };

    loadMarks();
  }, [assignmentId, getMarksForAssignment]);

  const handleEditClick = (mark) => {
    setEditingId(mark.studentMarkId);
    setEditedMarks({
      timelyMarks: mark.timelyMarks ?? '',
      plagiarismMarks: mark.plagiarismMarks ?? '',
      spoMarks: mark.spoMarks || '',
      feedback: mark.feedback || '',
    });
  };

  const handleSaveMarks = async (studentMarkId) => {
    if (editedMarks.timelyMarks === '' || editedMarks.timelyMarks === undefined) {
      alert('Please enter Timely marks');
      return;
    }

    if (editedMarks.plagiarismMarks === '' || editedMarks.plagiarismMarks === undefined) {
      alert('Please enter Plagiarism marks');
      return;
    }

    if (editedMarks.spoMarks === '' || editedMarks.spoMarks === undefined) {
      alert('Please enter SPO marks');
      return;
    }

    const timelyMarksNum = parseFloat(editedMarks.timelyMarks);
    if (isNaN(timelyMarksNum) || timelyMarksNum < 0 || timelyMarksNum > 2) {
      alert('Timely marks must be between 0 and 2');
      return;
    }

    const plagiarismMarksNum = parseFloat(editedMarks.plagiarismMarks);
    if (isNaN(plagiarismMarksNum) || plagiarismMarksNum < 0 || plagiarismMarksNum > 3) {
      alert('Plagiarism marks must be between 0 and 3');
      return;
    }

    const spoMarksNum = parseFloat(editedMarks.spoMarks);
    if (isNaN(spoMarksNum) || spoMarksNum < 0 || spoMarksNum > 5) {
      alert('SPO marks must be between 0 and 5');
      return;
    }

    try {
      setSavingId(studentMarkId);
      await finalizeMarks(studentMarkId, {
        timelyMarks: timelyMarksNum,
        plagiarismMarks: plagiarismMarksNum,
        spoMarks: spoMarksNum,
        feedback: editedMarks.feedback || null,
      });

      // Update marks in state
      setMarks(
        marks.map((m) =>
          m.studentMarkId === studentMarkId
            ? {
                ...m,
                timelyMarks: timelyMarksNum,
                plagiarismMarks: plagiarismMarksNum,
                spoMarks: spoMarksNum,
                feedback: editedMarks.feedback || m.feedback,
                status: 'FINALIZED',
              }
            : m
        )
      );

      setEditingId(null);
      setSuccessMessage('Marks finalized successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save marks');
      console.error('Error saving marks:', err);
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalStudents = marks.length;
  const finalizedCount = marks.filter((m) => m.status === 'FINALIZED').length;
  const pendingCount = totalStudents - finalizedCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1114] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2FF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading marks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1114] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#2A2F36] rounded-lg transition-colors"
          title="Go back"
        >
          <ChevronLeft className="h-6 w-6 text-[#00C2FF]" />
        </button>
        <h1 className="text-3xl font-bold text-[#F3F4F6]">Evaluate Marks</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/40 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4">
          <p className="text-emerald-300">{successMessage}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1C1F23] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Students</p>
          <p className="text-3xl font-bold text-[#F3F4F6]">{totalStudents}</p>
        </div>
        <div className="bg-[#1C1F23] border border-emerald-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            Finalized
          </p>
          <p className="text-3xl font-bold text-emerald-400">{finalizedCount}</p>
        </div>
        <div className="bg-[#1C1F23] border border-amber-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            Pending
          </p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto bg-[#1C1F23] border border-gray-700 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-[#0F1114]">
              <th className="px-6 py-4 text-left text-gray-400 font-semibold">Roll No</th>
              <th className="px-6 py-4 text-left text-gray-400 font-semibold">Student Name</th>
              <th className="px-6 py-4 text-left text-gray-400 font-semibold">Performance Date</th>
              <th className="px-6 py-4 text-left text-gray-400 font-semibold">Submission Date</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">RPP Marks</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">SPO Marks</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">Total</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">Status</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {marks.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                  No marks to evaluate
                </td>
              </tr>
            ) : (
              marks.map((mark) => (
                <tr
                  key={mark.studentMarkId}
                  className="border-b border-gray-700 hover:bg-[#2A2F36] transition-colors"
                >
                  <td className="px-6 py-4 text-[#F3F4F6]">{mark.studentRollNo || 'N/A'}</td>
                  <td className="px-6 py-4 text-[#F3F4F6]">{mark.studentName || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(mark.assignmentCreatedDate)}</td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(mark.submissionDate)}</td>
                  <td className="px-6 py-4 text-center text-[#F3F4F6]">
                    {editingId === mark.studentMarkId ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.5"
                          value={editedMarks.timelyMarks}
                          onChange={(e) => setEditedMarks({ ...editedMarks, timelyMarks: e.target.value })}
                          className="w-16 px-2 py-1 bg-[#0F1114] border border-gray-700 rounded text-[#F3F4F6] text-center"
                        />
                        <span className="text-gray-500">/</span>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          step="0.5"
                          value={editedMarks.plagiarismMarks}
                          onChange={(e) => setEditedMarks({ ...editedMarks, plagiarismMarks: e.target.value })}
                          className="w-16 px-2 py-1 bg-[#0F1114] border border-gray-700 rounded text-[#F3F4F6] text-center"
                        />
                      </div>
                    ) : (
                      <>
                        {Number(mark.timelyMarks ?? 0).toFixed(1)}/{Number(mark.plagiarismMarks ?? 0).toFixed(1)} ({(Number(mark.timelyMarks || 0) + Number(mark.plagiarismMarks || 0)).toFixed(1)}/5)
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === mark.studentMarkId ? (
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.5"
                        value={editedMarks.spoMarks}
                        onChange={(e) => setEditedMarks({ ...editedMarks, spoMarks: e.target.value })}
                        className="w-20 px-2 py-1 bg-[#0F1114] border border-gray-700 rounded text-[#F3F4F6] text-center"
                      />
                    ) : (
                      <span className="text-[#F3F4F6]">{mark.spoMarks !== null && mark.spoMarks !== undefined ? Number(mark.spoMarks).toFixed(1) : '-'}/5</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-[#00C2FF] font-semibold">
                    {(Number((editingId === mark.studentMarkId ? editedMarks.timelyMarks : mark.timelyMarks) || 0)
                      + Number((editingId === mark.studentMarkId ? editedMarks.plagiarismMarks : mark.plagiarismMarks) || 0)
                      + Number((editingId === mark.studentMarkId ? editedMarks.spoMarks : mark.spoMarks) || 0)).toFixed(1)}/10
                  </td>
                  <td className="px-6 py-4 text-center">
                    {mark.status === 'FINALIZED' ? (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium border border-emerald-500/30">
                        Finalized
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium border border-amber-500/30">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingId === mark.studentMarkId ? (
                      <button
                        onClick={() => handleSaveMarks(mark.studentMarkId)}
                        disabled={savingId === mark.studentMarkId}
                        className="bg-[#00C2FF] text-[#0F1114] px-3 py-1 rounded font-semibold text-sm hover:bg-[#00B8E6] transition-colors disabled:opacity-50"
                      >
                        {savingId === mark.studentMarkId ? 'Saving...' : 'Save'}
                      </button>
                    ) : mark.status === 'FINALIZED' ? (
                      <span className="text-gray-400 text-sm">Locked</span>
                    ) : (
                      <button
                        onClick={() => handleEditClick(mark)}
                        className="text-[#00C2FF] hover:underline text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {marks.length === 0 ? (
          <div className="bg-[#1C1F23] border border-gray-700 rounded-xl p-6 text-center">
            <p className="text-gray-400">No marks to evaluate</p>
          </div>
        ) : (
          marks.map((mark) => (
            <div
              key={mark.studentMarkId}
              className="bg-[#1C1F23] border border-gray-700 rounded-xl p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#F3F4F6] font-semibold">{mark.studentName}</p>
                  <p className="text-gray-400 text-sm">Roll: {mark.studentRollNo}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    mark.status === 'FINALIZED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {mark.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Performance Date</p>
                  <p className="text-[#F3F4F6] text-xs mt-1">{formatDate(mark.assignmentCreatedDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Submission Date</p>
                  <p className="text-[#F3F4F6] text-xs mt-1">{formatDate(mark.submissionDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-[#0F1114] rounded b p-3">
                <div>
                  <p className="text-gray-400 text-xs">Timely</p>
                  {editingId === mark.studentMarkId ? (
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.5"
                      value={editedMarks.timelyMarks}
                      onChange={(e) => setEditedMarks({ ...editedMarks, timelyMarks: e.target.value })}
                      className="w-full px-2 py-1 bg-[#1C1F23] border border-gray-700 rounded text-[#F3F4F6] font-semibold"
                    />
                  ) : (
                    <p className="text-[#00C2FF] font-semibold">{Number(mark.timelyMarks ?? 0).toFixed(1)}/2</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Plagiarism</p>
                  {editingId === mark.studentMarkId ? (
                    <input
                      type="number"
                      min="0"
                      max="3"
                      step="0.5"
                      value={editedMarks.plagiarismMarks}
                      onChange={(e) => setEditedMarks({ ...editedMarks, plagiarismMarks: e.target.value })}
                      className="w-full px-2 py-1 bg-[#1C1F23] border border-gray-700 rounded text-[#F3F4F6] font-semibold"
                    />
                  ) : (
                    <p className="text-[#00C2FF] font-semibold">{Number(mark.plagiarismMarks ?? 0).toFixed(1)}/3</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-xs">SPO Marks</p>
                  {editingId === mark.studentMarkId ? (
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={editedMarks.spoMarks}
                      onChange={(e) => setEditedMarks({ ...editedMarks, spoMarks: e.target.value })}
                      className="w-full px-2 py-1 bg-[#1C1F23] border border-gray-700 rounded text-[#F3F4F6] font-semibold"
                    />
                  ) : (
                    <p className="text-[#00C2FF] font-semibold">{mark.spoMarks !== null && mark.spoMarks !== undefined ? Number(mark.spoMarks).toFixed(1) : '-'}/5</p>
                  )}
                </div>
              </div>

              <div className="bg-[#0F1114] rounded p-3">
                <p className="text-gray-400 text-xs">Total</p>
                <p className="text-[#00C2FF] font-semibold text-lg mt-1">
                  {(Number((editingId === mark.studentMarkId ? editedMarks.timelyMarks : mark.timelyMarks) || 0)
                    + Number((editingId === mark.studentMarkId ? editedMarks.plagiarismMarks : mark.plagiarismMarks) || 0)
                    + Number((editingId === mark.studentMarkId ? editedMarks.spoMarks : mark.spoMarks) || 0)).toFixed(1)}/10
                </p>
              </div>

              {mark.status === 'FINALIZED' && (
                <div className="bg-[#0F1114] rounded p-3">
                  <p className="text-gray-400 text-xs">Feedback</p>
                  <p className="text-gray-300 text-sm mt-1">{mark.feedback || 'No feedback provided'}</p>
                </div>
              )}

              {editingId === mark.studentMarkId && (
                <div>
                  <label className="text-gray-400 text-xs block mb-2">Feedback (Optional)</label>
                  <textarea
                    value={editedMarks.feedback}
                    onChange={(e) => setEditedMarks({ ...editedMarks, feedback: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F1114] border border-gray-700 rounded text-[#F3F4F6] text-sm min-h-20 resize-none"
                    placeholder="Add feedback for the student..."
                  />
                </div>
              )}

              <div className="flex gap-2">
                {editingId === mark.studentMarkId ? (
                  <>
                    <button
                      onClick={() => handleSaveMarks(mark.studentMarkId)}
                      disabled={savingId === mark.studentMarkId}
                      className="flex-1 bg-[#00C2FF] text-[#0F1114] px-3 py-2 rounded font-semibold text-sm hover:bg-[#00B8E6] transition-colors disabled:opacity-50"
                    >
                      {savingId === mark.studentMarkId ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-700 text-[#F3F4F6] px-3 py-2 rounded font-semibold text-sm hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : mark.status === 'FINALIZED' ? (
                  <button
                    disabled
                    className="w-full bg-gray-700 text-gray-400 px-3 py-2 rounded font-semibold text-sm opacity-50 cursor-not-allowed"
                  >
                    Locked
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditClick(mark)}
                    className="w-full bg-[#00C2FF] text-[#0F1114] px-3 py-2 rounded font-semibold text-sm hover:bg-[#00B8E6] transition-colors"
                  >
                    Edit Marks
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarksEvaluation;
