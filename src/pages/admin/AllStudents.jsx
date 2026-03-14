import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE:  "bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-[#00C2FF]",
    REVOKED: "bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-800 border border-gray-700 text-gray-400"}`}>
      {status}
    </span>
  );
};

const AllStudents = () => {
  const { getAllStudents, loading } = useAdmin();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-[#F3F4F6]">All Students</h2>
          <p className="text-sm text-gray-500 mt-1">
            {students.length} student{students.length !== 1 ? "s" : ""} registered.
          </p>
        </div>

        <button
          onClick={load}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm
            border border-gray-700 text-gray-400
            hover:bg-[#2A2F36] hover:text-[#F3F4F6]
            transition-all
          "
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

      {students.length === 0 && !loading && !error ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
          <p className="text-[#F3F4F6] font-medium">No students found.</p>
        </div>
      ) : (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-[#0F1114]">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Roll No</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Dept / Year / Div</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Batch</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-[#F3F4F6]">{s.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{s.rollNo}</td>
                  <td className="px-6 py-4 text-gray-500">{s.email}</td>
                  <td className="px-6 py-4 text-gray-500">{s.department} / Yr {s.year} / Div {s.division}</td>
                  <td className="px-6 py-4 text-gray-500">{s.baseBatch}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.status} />
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

export default AllStudents;
