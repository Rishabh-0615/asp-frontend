import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { UserPlus, Key, CheckCircle, AlertCircle } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   Division map: department → year → divisions
────────────────────────────────────────────────────────── */
const DIVISION_MAP = {
  COMP: {
    1:  ["FY01","FY02","FY03","FY04","FY05","FY06","FY07","FY08","FY09","FY10","FY11","FY12","FY13"],
    2:  ["SY01","SY02","SY03","SY04","SY05","SY06","SY07","SY08","SY09","SY10","SY11","SY12","SY13"],
    3:  ["TE01","TE02","TE03","TE04"],
    4:  ["TE01","TE02","TE03","TE04"],
  },
  IT: {
    1:  ["FY01","FY02","FY03","FY04","FY05","FY06","FY07","FY08","FY09","FY10","FY11","FY12","FY13"],
    2:  ["SY01","SY02","SY03","SY04","SY05","SY06","SY07","SY08","SY09","SY10","SY11","SY12","SY13"],
    3:  ["TE09","TE10","TE11"],
    4:  ["TE09","TE10","TE11"],
  },
  ENTC: {
    1:  ["FY01","FY02","FY03","FY04","FY05","FY06","FY07","FY08","FY09","FY10","FY11","FY12","FY13"],
    2:  ["SY01","SY02","SY03","SY04","SY05","SY06","SY07","SY08","SY09","SY10","SY11","SY12","SY13"],
    3:  ["TE05","TE06","TE07","TE08"],
    4:  ["TE05","TE06","TE07","TE08"],
  },
  AIDS: {
    1:  ["FY01","FY02","FY03","FY04","FY05","FY06","FY07","FY08","FY09","FY10","FY11","FY12","FY13"],
    2:  ["SY01","SY02","SY03","SY04","SY05","SY06","SY07","SY08","SY09","SY10","SY11","SY12","SY13"],
    3:  ["TE12"],
    4:  ["TE12"],
  },
  ECE: {
    1:  ["FY01","FY02","FY03","FY04","FY05","FY06","FY07","FY08","FY09","FY10","FY11","FY12","FY13"],
    2:  ["SY01","SY02","SY03","SY04","SY05","SY06","SY07","SY08","SY09","SY10","SY11","SY12","SY13"],
    3:  ["TE13"],
    4:  ["TE13"],
  },
  FY: {
    1:  ["FY01","FY02","FY03","FY04","FY05","FY06","FY07","FY08","FY09","FY10","FY11","FY12","FY13"],
  },
};

const DEPARTMENTS = ["COMP", "IT", "ENTC", "AIDS", "ECE", "FY"];

const YEAR_LABELS = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Fourth Year",
};

const EMPTY_FORM = {
  rollNo: "", email: "", name: "",
  department: "", year: "", division: "",
  baseBatch: "", tempPassword: "",
};

/* ──────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────── */
const CreateStudent = () => {
  const { createStudent, generateTempPassword, loading } = useAdmin();
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage]         = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);

  /* Available years for selected department */
  const availableYears = formData.department
    ? Object.keys(DIVISION_MAP[formData.department] || {}).map(Number)
    : [];

  /* Available divisions for selected department + year */
  const availableDivisions =
    formData.department && formData.year
      ? DIVISION_MAP[formData.department]?.[Number(formData.year)] || []
      : [];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset downstream fields when department or year changes
    if (name === "department") {
      setFormData((prev) => ({ ...prev, department: value, year: "", division: "" }));
      return;
    }
    if (name === "year") {
      setFormData((prev) => ({ ...prev, year: value, division: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGeneratePassword = async () => {
    try {
      const response = await generateTempPassword();
      const pwd = response?.data?.tempPassword || response?.tempPassword || response?.password;
      if (pwd) setFormData((prev) => ({ ...prev, tempPassword: pwd }));
      else setMessage({ success: false, text: "Could not parse generated password." });
    } catch {
      setMessage({ success: false, text: "Failed to generate password." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage(null);
    try {
      const response = await createStudent(formData);
      if (response?.success) {
        setMessage({ success: true, text: response.message || "Student created successfully!" });
        setFormData(EMPTY_FORM);
      }
    } catch (error) {
      setMessage({ success: false, text: error.message || "Failed to create student." });
    } finally {
      setFormLoading(false);
    }
  };

  const inputClass = "w-full ui-control";

  const disabledSelectClass = `${inputClass} opacity-40 cursor-not-allowed`;
  const labelClass = "block text-sm font-medium text-[#F3F4F6] mb-2";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#F3F4F6] mb-2">Create New Student</h2>
        <p className="text-sm text-gray-500">Add a student account with all required information</p>
      </div>

      <form onSubmit={handleSubmit} className="ui-surface p-8 space-y-6">

        {/* Roll No */}
        <div>
          <label className={labelClass} htmlFor="rollNo">Roll Number <span className="text-[#F87171]">*</span></label>
          <input type="text" id="rollNo" name="rollNo" value={formData.rollNo}
            onChange={handleChange} className={inputClass} placeholder="e.g., CS001" required />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass} htmlFor="email">Email <span className="text-[#F87171]">*</span></label>
          <input type="email" id="email" name="email" value={formData.email}
            onChange={handleChange} className={inputClass} placeholder="e.g., student@example.com" required />
        </div>

        {/* Name */}
        <div>
          <label className={labelClass} htmlFor="name">Full Name <span className="text-[#F87171]">*</span></label>
          <input type="text" id="name" name="name" value={formData.name}
            onChange={handleChange} className={inputClass} placeholder="e.g., John Doe" required />
        </div>

        {/* Department + Year */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass} htmlFor="department">Department <span className="text-[#F87171]">*</span></label>
            <select id="department" name="department" value={formData.department}
              onChange={handleChange} className={inputClass} required>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="year">
              Year <span className="text-[#F87171]">*</span>
              {!formData.department && <span className="text-gray-600 font-normal ml-1">(select dept first)</span>}
            </label>
            <select
              id="year" name="year" value={formData.year}
              onChange={handleChange}
              className={formData.department ? inputClass : disabledSelectClass}
              disabled={!formData.department}
              required
            >
              <option value="">Select year</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{YEAR_LABELS[y]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Division + Base Batch */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass} htmlFor="division">
              Division <span className="text-[#F87171]">*</span>
              {!formData.year && <span className="text-gray-600 font-normal ml-1">(select year first)</span>}
            </label>
            <select
              id="division" name="division" value={formData.division}
              onChange={handleChange}
              className={formData.year ? inputClass : disabledSelectClass}
              disabled={!formData.year}
              required
            >
              <option value="">Select division</option>
              {availableDivisions.map((div) => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="baseBatch">Base Batch <span className="text-[#F87171]">*</span></label>
            <input type="text" id="baseBatch" name="baseBatch" value={formData.baseBatch}
              onChange={handleChange} className={inputClass} placeholder="e.g., COMP_TE01" required />
          </div>
        </div>

        {/* Temp Password */}
        <div>
          <label className={labelClass} htmlFor="tempPassword">
            Temporary Password <span className="text-[#F87171]">*</span>
          </label>
          <div className="flex gap-3">
            <input type="text" id="tempPassword" name="tempPassword" value={formData.tempPassword}
              onChange={handleChange} className={`${inputClass} flex-1`}
              placeholder="Enter or generate password" required />
            <button
              type="button"
              onClick={handleGeneratePassword}
              disabled={loading}
              className="ui-btn ui-btn-secondary px-4 disabled:opacity-50"
            >
              <Key size={15} />
              Generate
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">This password will be used for initial account activation</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={formLoading || loading}
          className="w-full ui-btn ui-btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={17} />
          {formLoading ? "Creating Student..." : "Create Student"}
        </button>
      </form>

      {/* Result message */}
      {message && (
        <div className={`mt-6 p-5 rounded-xl border flex items-start gap-3 ${message.success ? "bg-[#00C2FF]/10 border-[#00C2FF]/30" : "bg-red-950/40 border-red-800"}`}>
          {message.success
            ? <CheckCircle size={18} className="text-[#00C2FF] mt-0.5" />
            : <AlertCircle size={18} className="text-[#F87171] mt-0.5" />
          }
          <p className={`font-medium text-sm ${message.success ? "text-[#00C2FF]" : "text-[#F87171]"}`}>
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateStudent;