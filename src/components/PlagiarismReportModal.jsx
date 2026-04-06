import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const PlagiarismReportModal = ({ isOpen, onClose, assignmentId, report }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && assignmentId) {
      fetchPlagiarismReport();
    }
  }, [isOpen, assignmentId]);

  const fetchPlagiarismReport = async () => {
    console.log('🔍 Fetching plagiarism report for assignment:', assignmentId);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/plagiarism/report/${assignmentId}`, {
        credentials: 'include'
      });
      
      // Check if response is OK (status 200-299)
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setError(`API Error (${response.status}): ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      console.log('📊 Report data received:', data);
      
      if (data.success) {
        setReportData(data);
        console.log('✅ Report loaded with', data.totalMatches, 'matches');
      } else {
        setError(data.message || 'Failed to fetch plagiarism report');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching plagiarism report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    console.log('🚀 Starting plagiarism analysis...');
    setLoading(true);
    setError(null);
    setReportData(null);  // Clear previous report while analyzing
    
    try {
      // Step 1: Trigger the analysis
      console.log('📊 Calling analyze endpoint...');
      const analyzeResponse = await fetch(`${BASE_URL}/api/plagiarism/analyze/${assignmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        console.error('API Error:', analyzeResponse.status, errorText);
        setError(`Analysis failed (${analyzeResponse.status}): ${analyzeResponse.statusText}`);
        return;
      }
      
      const analyzeData = await analyzeResponse.json();
      console.log('✅ Analysis completed:', analyzeData);
      
      if (!analyzeData.success) {
        setError(analyzeData.message || 'Failed to analyze plagiarism');
        return;
      }
      
      // Step 2: Fetch the latest report from database
      console.log('📥 Fetching latest report...');
      const reportResponse = await fetch(`${BASE_URL}/api/plagiarism/report/${assignmentId}`, {
        credentials: 'include'
      });
      
      if (!reportResponse.ok) {
        const errorText = await reportResponse.text();
        console.error('Report fetch error:', reportResponse.status, errorText);
        setError(`Failed to fetch report (${reportResponse.status}): ${reportResponse.statusText}`);
        return;
      }
      
      const reportData = await reportResponse.json();
      console.log('✅ Report fetched successfully:', reportData);
      
      if (reportData.success) {
        setReportData(reportData);
        console.log('📋 Report displayed with', reportData.totalMatches, 'matches');
      } else {
        setError(reportData.message || 'Failed to fetch plagiarism report');
      }
    } catch (err) {
      console.error('❌ Error during analysis:', err);
      setError('Error analyzing plagiarism: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (status) => {
    switch(status) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSimilarityIcon = (status) => {
    switch(status) {
      case 'HIGH':
        return <XCircle size={16} />;
      case 'MEDIUM':
        return <AlertTriangle size={16} />;
      case 'LOW':
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Plagiarism Analysis Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <XCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-gray-600">Analyzing submissions...</span>
          </div>
        ) : reportData ? (
          <div>
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalSubmissions || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalMatches || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-600 font-semibold">High Similarity</p>
                <p className="text-2xl font-bold text-red-600">{reportData.highSimilarityCount || 0}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-600 font-semibold">Medium Similarity</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.mediumSimilarityCount || 0}</p>
              </div>
            </div>

            {/* Analysis Date */}
            {reportData.analysisDate && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600">
                  <strong>Last Analysis:</strong> {new Date(reportData.analysisDate).toLocaleString()}
                </p>
              </div>
            )}

            {/* Matches Table */}
            {reportData.matches && reportData.matches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-3 font-semibold text-gray-700">Student 1</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Student 2</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Similarity %</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Matched Lines</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.matches.map((match, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{match.student1Name}</div>
                          <div className="text-xs text-gray-600">{match.student1RollNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{match.student2Name}</div>
                          <div className="text-xs text-gray-600">{match.student2RollNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-lg">
                            {match.similarityPercentage.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getSimilarityColor(match.status)}`}>
                            {getSimilarityIcon(match.status)}
                            {match.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{match.matchedLines}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle size={32} className="mx-auto text-green-600 mb-2" />
                <p className="text-green-700 font-semibold">No plagiarism detected!</p>
                <p className="text-sm text-green-600">All submissions appear to be original.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-6 text-lg">No plagiarism report available.</p>
            <button
              onClick={triggerAnalysis}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Run Plagiarism Analysis'}
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between gap-4 border-t pt-6">
          <button
            onClick={triggerAnalysis}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismReportModal;

