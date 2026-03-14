import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE:  "bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-[#00C2FF]",
    PENDING: "bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]",
    REVOKED: "bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
};

const AllFaculties = () => {
  const { getAllFaculties, loading } = useAdmin();
  const [faculties, setFaculties] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const data = await getAllFaculties();
      setFaculties(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-[#F3F4F6]">All Faculties</h2>
          <p className="text-sm text-gray-500 mt-1">
            {faculties.length} faculty member{faculties.length !== 1 ? "s" : ""} registered.
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

      {faculties.length === 0 && !loading && !error ? (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl p-14 text-center">
          <p className="text-[#F3F4F6] font-medium">No faculty members found.</p>
        </div>
      ) : (
        <div className="bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-[#0F1114]">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-[#F3F4F6]">
                    <span className="flex items-center gap-2">
                      {f.name}
                      {f.admin && <ShieldCheck size={14} className="text-[#F59E0B] shrink-0" />}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{f.email}</td>
                  <td className="px-6 py-4 text-gray-500">{f.admin ? "Admin" : "Faculty"}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={f.status} />
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

export default AllFaculties;
