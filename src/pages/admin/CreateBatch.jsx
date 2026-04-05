import { useEffect, useMemo, useState } from "react";
import { CheckCircle, AlertCircle, Layers3 } from "lucide-react";
import { useBatch } from "../../context/BatchContext";

const EMPTY_FORM = {
  department: "",
  year: "",
  division: "",
  baseBatch: "",
  semester: "",
  subjectName: "",
  labManualFile: null,
};

const CreateBatch = () => {
  const { loading, getBatchOptions, createBatch, uploadBatchLabManual } = useBatch();

  const [options, setOptions] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await getBatchOptions();
        setOptions(data);
        setForm((prev) => ({ ...prev, department: data?.department || "" }));
      } catch (err) {
        setMessage({ success: false, text: err.message });
      }
    };

    loadOptions();
  }, []);

  const yearOptions = useMemo(() => {
    if (!options?.yearDivisions) return [];
    return Object.keys(options.yearDivisions)
      .map(Number)
      .sort((a, b) => a - b);
  }, [options]);

  const divisionOptions = useMemo(() => {
    if (!form.year || !options?.yearDivisions) return [];
    return options.yearDivisions[String(form.year)] || options.yearDivisions[Number(form.year)] || [];
  }, [form.year, options]);

  const baseBatchOptions = useMemo(() => {
    if (!form.division || !options?.divisionBaseBatches) return [];
    return options.divisionBaseBatches[form.division] || [];
  }, [form.division, options]);

  const semesterOptions = useMemo(() => {
    if (!options?.thirdYearSubjectsBySemester) return [];
    return Object.keys(options.thirdYearSubjectsBySemester)
      .map(Number)
      .sort((a, b) => a - b);
  }, [options]);

  const subjectOptions = useMemo(() => {
    if (!form.semester || !options?.thirdYearSubjectsBySemester) return [];
    return (
      options.thirdYearSubjectsBySemester[String(form.semester)] ||
      options.thirdYearSubjectsBySemester[Number(form.semester)] ||
      []
    );
  }, [form.semester, options]);

  const onFieldChange = (name, value) => {
    setMessage(null);
    if (name === "labManualFile") {
      setForm((prev) => ({ ...prev, labManualFile: value }));
      return;
    }

    if (name === "year") {
      setForm((prev) => ({
        ...prev,
        year: value,
        division: "",
        baseBatch: "",
        semester: "",
        subjectName: "",
      }));
      return;
    }

    if (name === "division") {
      setForm((prev) => ({
        ...prev,
        division: value,
        baseBatch: "",
      }));
      return;
    }

    if (name === "semester") {
      setForm((prev) => ({
        ...prev,
        semester: value,
        subjectName: "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        department: form.department,
        year: Number(form.year),
        division: form.division,
        baseBatch: form.baseBatch,
        semester: Number(form.semester),
        subjectName: form.subjectName,
      };

      const res = await createBatch(payload);
      const mapped = res?.data?.mappedStudentCount ?? 0;
      let messageText = `Batch created successfully. ${mapped} students were linked.`;

      if (form.labManualFile) {
        const createdBatchId = res?.data?.batchId;

        if (createdBatchId) {
          await uploadBatchLabManual(createdBatchId, form.labManualFile);
          messageText += " Lab manual uploaded successfully.";
        }
      }

      setMessage({
        success: true,
        text: messageText,
      });
      setForm((prev) => ({
        ...EMPTY_FORM,
        department: prev.department,
      }));
    } catch (err) {
      setMessage({ success: false, text: err.message || "Failed to create batch." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full ui-control";
  const disabledClass = `${inputClass} opacity-50 cursor-not-allowed`;
  const labelClass = "block text-sm text-[#F3F4F6] mb-2";
  const yearLabel = (year) => options?.yearLabels?.[String(year)] || options?.yearLabels?.[Number(year)] || `Year ${year}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#F3F4F6] mb-2">Create Subject Batch</h2>
        <p className="text-sm text-gray-500">
          Faculty can create only catalog-valid IT batches with dropdown-only fields.
        </p>
      </div>

      <form onSubmit={submit} className="ui-surface p-8 space-y-6">
        <div>
          <label className={labelClass}>Department</label>
          <select
            value={form.department}
            onChange={(e) => onFieldChange("department", e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select department</option>
            {options?.department && <option value={options.department}>{options.department}</option>}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Year</label>
            <select
              value={form.year}
              onChange={(e) => onFieldChange("year", e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select year</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>{yearLabel(y)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Division
              {!form.year && <span className="text-gray-600 font-normal ml-1">(select year first)</span>}
            </label>
            <select
              value={form.division}
              onChange={(e) => onFieldChange("division", e.target.value)}
              className={form.year ? inputClass : disabledClass}
              disabled={!form.year}
              required
            >
              <option value="">Select division</option>
              {divisionOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>
              Base Batch
              {!form.division && <span className="text-gray-600 font-normal ml-1">(select division first)</span>}
            </label>
            <select
              value={form.baseBatch}
              onChange={(e) => onFieldChange("baseBatch", e.target.value)}
              className={form.division ? inputClass : disabledClass}
              disabled={!form.division}
              required
            >
              <option value="">Select base batch</option>
              {baseBatchOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Semester
              {!form.year && <span className="text-gray-600 font-normal ml-1">(select year first)</span>}
            </label>
            <select
              value={form.semester}
              onChange={(e) => onFieldChange("semester", e.target.value)}
              className={form.year ? inputClass : disabledClass}
              disabled={!form.year}
              required
            >
              <option value="">Select semester</option>
              {semesterOptions.map((s) => (
                <option key={s} value={s}>{`Semester ${s}`}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Subject</label>
          <select
            value={form.subjectName}
            onChange={(e) => onFieldChange("subjectName", e.target.value)}
            className={form.semester ? inputClass : disabledClass}
            disabled={!form.semester}
            required
          >
            <option value="">Select subject</option>
            {subjectOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Lab Manual (Optional)</label>
          <input
            type="file"
            onChange={(e) => onFieldChange("labManualFile", e.target.files?.[0] || null)}
            className={inputClass}
          />
          <p className="text-xs text-gray-500 mt-2">
            Optional: you can upload or change the lab manual later from Batch Details.
          </p>
          {form.labManualFile && (
            <p className="text-xs text-[#9fdaed] mt-1">Selected: {form.labManualFile.name}</p>
          )}
        </div>

        <div className="rounded-xl border border-[#00C2FF]/25 bg-[#00C2FF]/5 p-4 text-sm text-gray-300 flex items-start gap-3">
          <Layers3 size={16} className="text-[#00C2FF] mt-0.5" />
          <p>
            On submit, matching students already in DB for selected department/year/division/base batch are automatically added to `batch_students`.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || submitting}
          className="w-full ui-btn ui-btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating Batch..." : "Create Batch"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-6 p-5 rounded-xl border flex items-start gap-3 ${message.success ? "bg-[#00C2FF]/10 border-[#00C2FF]/30" : "bg-red-950/40 border-red-800"
            }`}
        >
          {message.success ? (
            <CheckCircle size={18} className="text-[#00C2FF] mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-[#F87171] mt-0.5" />
          )}
          <p className={`font-medium text-sm ${message.success ? "text-[#00C2FF]" : "text-[#F87171]"}`}>
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateBatch;
