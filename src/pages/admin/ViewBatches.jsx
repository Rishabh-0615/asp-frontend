import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useBatch } from "../../context/BatchContext";

const ViewBatches = ({ onOpenBatchDetails }) => {
  const { loading, getMyBatches } = useBatch();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const load = async () => {
    setError(null);
    try {
      const data = await getMyBatches();
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsInitialLoad(false);
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
          className="ui-btn ui-btn-secondary"
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

      {(loading || isInitialLoad) && rows.length === 0 ? (
        <>
          <div className="hidden md:block bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-10 rounded-lg bg-[#2A2F36] animate-pulse" />
              ))}
            </div>
          </div>
          <div className="md:hidden space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-1/2 rounded bg-[#2A2F36] mb-2" />
                <div className="h-4 w-3/4 rounded bg-[#2A2F36] mb-2" />
                <div className="h-4 w-2/3 rounded bg-[#2A2F36]" />
              </div>
            ))}
          </div>
        </>
      ) : rows.length === 0 && !loading && !isInitialLoad && !error ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
          <p className="text-[#F3F4F6] font-medium">No subject batches found.</p>
          <p className="text-gray-500 text-sm mt-2">Create one from the Create Batch tab.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-[#0F1114]">
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Year</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Division</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Base Batch</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Subject</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Students</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Created At</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Action</th>
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
                      {r.createdAt ? new Date(r.createdAt).toLocaleString([], { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onOpenBatchDetails?.(r.batchId)}
                        className="ui-btn ui-btn-accent min-h-9 px-3 py-1.5 text-xs"
                      >
                        Batch Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3 pb-20">
            {rows.map((r) => (
              <div key={r.batchId} className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-4">
                <p className="text-[#F3F4F6] font-medium text-sm">{r.subjectName}</p>
                <p className="text-xs text-gray-400 mt-1">{r.yearLabel || `Year ${r.year}`} / {r.division} / {r.baseBatch}</p>
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="bg-[#0F1114] border border-gray-700 rounded-lg p-2.5">
                    <p className="text-gray-500">Students</p>
                    <p className="text-[#00C2FF] font-semibold mt-1">{r.studentCount}</p>
                  </div>
                  <div className="bg-[#0F1114] border border-gray-700 rounded-lg p-2.5">
                    <p className="text-gray-500">Created</p>
                    <p className="text-gray-300 mt-1">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenBatchDetails?.(r.batchId)}
                  className="mt-3 w-full min-h-10 px-3 py-2 rounded-lg border border-[#00C2FF]/40 bg-[#00C2FF]/10 text-[#9fdaed] text-xs font-medium"
                >
                  Batch Details
                </button>
              </div>
            ))}
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-[#0F1114]/95 backdrop-blur px-4 py-3">
            <button
              type="button"
              onClick={load}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm min-h-11"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh batches
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewBatches;
