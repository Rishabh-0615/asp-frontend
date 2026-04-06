import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';

const riskStyles = {
  HIGH: 'text-red-300 border-red-500/40 bg-red-500/10',
  MEDIUM: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  LOW: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
};

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'N/A';
  }
  return `${Number(value).toFixed(1)}%`;
};

const StudentOriginalityReportModal = ({ isOpen, loading, error, report, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#15181d] border border-gray-700 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#15181d] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-semibold text-[#F3F4F6]">Student Originality Report</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#2A2F36]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading && (
            <div className="flex items-center gap-3 text-gray-300">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-400"></div>
              Loading report...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && report && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Student</p>
                  <p className="text-[#F3F4F6] font-semibold mt-1">{report.studentName || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">Roll No: {report.studentRollNo || 'N/A'}</p>
                  <p className="text-gray-400 text-sm mt-2">Assignment: {report.assignmentTitle || 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Risk Level</p>
                  <div className={`inline-flex mt-2 px-3 py-1 rounded-full border text-xs font-semibold ${riskStyles[report.riskLevel] || riskStyles.MEDIUM}`}>
                    {report.riskLevel || 'MEDIUM'}
                  </div>
                  <p className="text-gray-300 text-sm mt-3">{report.summary || 'No summary available.'}</p>
                </div>
              </div>

              {!report.analysisReady && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200 text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5" />
                  Analysis is incomplete. Run Check Plagiarism and Recalculate AI (All), then auto-fill marks.
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
                  <p className="text-gray-400 text-xs">Batch Similarity %</p>
                  <p className="text-[#F3F4F6] text-lg font-semibold mt-1">{formatPercent(report.batchSimilarityPercent)}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
                  <p className="text-gray-400 text-xs">AI Generated %</p>
                  <p className="text-[#F3F4F6] text-lg font-semibold mt-1">{formatPercent(report.aiGeneratedPercent)}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
                  <p className="text-gray-400 text-xs">Batch Marks (out of 1)</p>
                  <p className="text-[#F3F4F6] text-lg font-semibold mt-1">{report.batchSimilarityMarks ?? 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
                  <p className="text-gray-400 text-xs">AI Marks (out of 2)</p>
                  <p className="text-[#F3F4F6] text-lg font-semibold mt-1">{report.aiSimilarityMarks ?? 'N/A'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-700 bg-[#0F1114] p-4">
                <p className="text-gray-300 font-semibold mb-3 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-sky-300" />
                  Top Similarity Matches In Batch
                </p>

                {!report.peerInsights || report.peerInsights.length === 0 ? (
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-300" />
                    No peer similarity matches were found for this student.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                          <th className="text-left py-2 pr-3">Peer</th>
                          <th className="text-left py-2 pr-3">Roll No</th>
                          <th className="text-left py-2 pr-3">Similarity</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.peerInsights.map((match, index) => (
                          <tr key={`${match.peerRollNo || 'peer'}-${index}`} className="border-b border-gray-800">
                            <td className="py-2 pr-3 text-[#F3F4F6]">{match.peerName || 'Unknown'}</td>
                            <td className="py-2 pr-3 text-gray-300">{match.peerRollNo || 'N/A'}</td>
                            <td className="py-2 pr-3 text-gray-300">{formatPercent(match.similarityPercentage)}</td>
                            <td className="py-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${riskStyles[match.status] || 'text-gray-300 border-gray-600 bg-[#1a1f25]'}`}>
                                {match.status || 'UNKNOWN'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOriginalityReportModal;
