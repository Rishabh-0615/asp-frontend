import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useBatch } from "../../context/BatchContext";

const ViewBatches = () => {
  const { loading, getMyBatches } = useBatch();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const data = await getMyBatches();
      setRows(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-[#F3F4F6]">My Subject Batches</h2>
          <p className="text-sm text-gray-500 mt-1">
            {rows.length} batch{rows.length !== 1 ? "es" : ""} created.
          </p>
        </div>

        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-700 text-gray-400 hover:bg-[#2A2F36] hover:text-[#F3F4F6] transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-sm text-[#F87171]">
          {error}
        </div>
      )}

      {rows.length === 0 && !loading && !error ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
          <p className="text-[#F3F4F6] font-medium">No subject batches found.</p>
          <p className="text-gray-500 text-sm mt-2">Create one from the Create Batch tab.</p>
        </div>
      ) : (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-[#0F1114]">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Year</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Division</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Base Batch</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Subject</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Students</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Created At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.batchId} className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors">
                  <td className="px-6 py-4 text-gray-300">{r.yearLabel || `Year ${r.year}`}</td>
                  <td className="px-6 py-4 text-gray-300">{r.division}</td>
                  <td className="px-6 py-4 text-gray-300">{r.baseBatch}</td>
                  <td className="px-6 py-4 text-[#F3F4F6] font-medium">{r.subjectName}</td>
                  <td className="px-6 py-4 text-[#00C2FF] font-semibold">{r.studentCount}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewBatches;
