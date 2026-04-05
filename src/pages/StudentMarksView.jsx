import React, { useState, useEffect } from 'react';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { useAssignment } from '../context/AssignmentContext';
import { useStudentAuth } from '../context/StudentAuthContext';

const StudentMarksView = ({ batchId, studentId, onBack }) => {
  const [marks, setMarks] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(batchId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { getStudentBatchMarks } = useAssignment();
  const { myBatches } = useStudentAuth();

  useEffect(() => {
    if (batchId) {
      setSelectedBatchId(batchId);
      return;
    }

    if (!selectedBatchId && myBatches?.length > 0) {
      setSelectedBatchId(myBatches[0].batchId);
    }
  }, [batchId, myBatches, selectedBatchId]);

  useEffect(() => {
    const loadMarks = async () => {
      if (!selectedBatchId || !studentId) {
        setMarks([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getStudentBatchMarks(selectedBatchId, studentId);
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
  }, [selectedBatchId, studentId, getStudentBatchMarks]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateTotalMarks = () => {
    return marks.reduce((sum, mark) => {
      const rpp = (Number(mark.timelyMarks || 0) + Number(mark.plagiarismMarks || 0)) || 0;
      const spo = Number(mark.spoMarks || 0);
      return sum + rpp + spo;
    }, 0);
  };

  const calculatePossibleMarks = () => {
    return marks.length * 10; // Each assignment is out of 10 marks
  };

  const averagePerAssignment = marks.length > 0 ? (calculateTotalMarks() / marks.length).toFixed(2) : 0;

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
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">My Marks</h1>
          <p className="text-gray-400 text-sm mt-1">View all your assignment marks</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">Batch</label>
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          className="w-full md:w-96 ui-control"
        >
          {myBatches?.length ? (
            myBatches.map((batch) => (
              <option key={batch.batchId} value={batch.batchId}>
                {(batch.subjectName || 'Subject')} - {(batch.yearLabel || `Year ${batch.year || '-'}`)} - {(batch.division || '-')} - {(batch.baseBatch || '-')}
              </option>
            ))
          ) : (
            <option value="">No batches available</option>
          )}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/40 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {marks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1C1F23] border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Assignments</p>
            <p className="text-3xl font-bold text-[#F3F4F6]">{marks.length}</p>
          </div>
          <div className="bg-[#1C1F23] border border-[#00C2FF]/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total Marks</p>
            <p className="text-3xl font-bold text-[#00C2FF]">
              {calculateTotalMarks().toFixed(1)}/{calculatePossibleMarks()}
            </p>
          </div>
          <div className="bg-[#1C1F23] border border-emerald-500/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Average per Assignment</p>
            <p className="text-3xl font-bold text-emerald-400">{averagePerAssignment}/10</p>
          </div>
          <div className="bg-[#1C1F23] border border-amber-500/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Percentage
            </p>
            <p className="text-3xl font-bold text-amber-400">
              {marks.length > 0 ? ((calculateTotalMarks() / calculatePossibleMarks()) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto bg-[#1C1F23] border border-gray-700 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-[#0F1114]">
              <th className="px-6 py-4 text-left text-gray-400 font-semibold">Assignment</th>
              <th className="px-6 py-4 text-left text-gray-400 font-semibold">Performance Date</th>
              <th className="px-6 py-4 text-left text-gray-400 font-semibold">Submission Date</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">Timely (2)</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">Plagiarism (3)</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">RPP Total</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">SPO (5)</th>
              <th className="px-6 py-4 text-center text-gray-400 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {marks.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                  No marks to display
                </td>
              </tr>
            ) : (
              [...marks]
                .sort((a, b) => new Date(a.assignmentCreatedDate) - new Date(b.assignmentCreatedDate))
                .map((mark, index) => {
                  const rppTotal = Number(mark.timelyMarks || 0) + Number(mark.plagiarismMarks || 0);
                  const spo = Number(mark.spoMarks || 0);
                  const total = rppTotal + spo;
                  const isFinalized = mark.status === 'FINALIZED';
                  return (
                    <tr key={mark.studentMarkId} className="border-b border-gray-700 hover:bg-[#2A2F36] transition-colors">
                      <td className="px-6 py-4 text-[#F3F4F6]">{mark.assignmentTitle}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(mark.assignmentCreatedDate)}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{mark.submissionDate ? formatDate(mark.submissionDate) : 'Not Submitted'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${Number(mark.timelyMarks) === 2
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                          }`}>
                          {mark.timelyMarks ? mark.timelyMarks.toFixed(1) : '0'}/2
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 rounded text-sm font-semibold bg-[#00C2FF]/20 text-[#00C2FF]">
                          {mark.plagiarismMarks ? mark.plagiarismMarks.toFixed(1) : '0'}/3
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 rounded text-sm font-semibold bg-[#00C2FF]/20 text-[#00C2FF]">
                          {rppTotal.toFixed(1)}/5
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isFinalized ? (
                          <span className="px-2 py-1 rounded text-sm font-semibold bg-green-500/20 text-green-400">
                            {spo.toFixed(1)}/5
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-sm font-semibold bg-gray-700 text-gray-400">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 rounded text-sm font-bold bg-[#00C2FF]/20 text-[#00C2FF]">
                          {total.toFixed(1)}/10
                        </span>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {marks.length === 0 ? (
          <div className="bg-[#1C1F23] border border-gray-700 rounded-xl p-6 text-center">
            <p className="text-gray-400">No marks to display yet</p>
          </div>
        ) : (
          marks.map((mark) => {
            const rppTotal = Number(mark.timelyMarks || 0) + Number(mark.plagiarismMarks || 0);
            const spo = Number(mark.spoMarks || 0);
            const total = rppTotal + spo;
            const isFinalized = mark.status === 'FINALIZED';
            return (
              <div
                key={mark.studentMarkId}
                className="bg-[#1C1F23] border border-gray-700 rounded-xl p-4 space-y-4"
              >
                <div>
                  <p className="text-[#F3F4F6] font-semibold">{mark.assignmentTitle}</p>
                  <p className="text-gray-400 text-xs mt-1">Assigned: {formatDate(mark.assignmentCreatedDate)}</p>
                  <p className="text-gray-400 text-xs">
                    Submitted: {mark.submissionDate ? formatDate(mark.submissionDate) : 'Not Submitted'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#0F1114] rounded p-3">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Timely</p>
                    <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${Number(mark.timelyMarks) === 2
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                      }`}>
                      {mark.timelyMarks ? mark.timelyMarks.toFixed(1) : '0'}/2
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Plagiarism</p>
                    <span className="inline-block px-2 py-1 rounded text-sm font-semibold bg-[#00C2FF]/20 text-[#00C2FF]">
                      {mark.plagiarismMarks ? mark.plagiarismMarks.toFixed(1) : '0'}/3
                    </span>
                  </div>
                  {/* <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">RPP Total</p>
                    <span className="inline-block px-2 py-1 rounded text-sm font-semibold bg-blue-500/20 text-blue-400">
                      {rppTotal.toFixed(1)}/5
                    </span>
                  </div> */}
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">RPP Total</p>
                    <span className="inline-block px-2 py-1 rounded text-sm font-semibold bg-[#00C2FF]/20 text-[#00C2FF]">
                      {rppTotal.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">SPO</p>
                    {isFinalized ? (
                      <span className="inline-block px-2 py-1 rounded text-sm font-semibold bg-green-500/20 text-green-400">
                        {spo.toFixed(1)}/5
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded text-sm font-semibold bg-gray-700 text-gray-400">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gradient-to-r from-[#00C2FF]/10 to-blue-500/10 rounded-lg p-3 border border-[#00C2FF]/20">
                  <span className="text-gray-400">Total Score</span>
                  <span className="text-2xl font-bold text-[#00C2FF]">{total.toFixed(1)}/10</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentMarksView;
