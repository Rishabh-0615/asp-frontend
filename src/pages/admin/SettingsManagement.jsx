import { useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../context/AdminContext";
import { useBatch } from "../../context/BatchContext";
import { useAssignment } from "../../context/AssignmentContext";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const inferSemesterForSubject = (subjectName, options) => {
  if (!subjectName || !options?.thirdYearSubjectsBySemester) return "";
  const map = options.thirdYearSubjectsBySemester;
  const semester = Object.keys(map).find((key) =>
    (map[key] || []).includes(subjectName)
  );
  return semester || "";
};

const sectionCard = "bg-[#1C1F23] border border-gray-700 rounded-2xl overflow-hidden";
const tableHead = "text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-wide";
const actionBtn = "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all";
const rowsPerPage = 15;

const normalize = (value) => String(value || "").toLowerCase();

const includesSearch = (value, search) => normalize(value).includes(normalize(search));

const toPreviewRows = (row, definitions) =>
  definitions.map((item) => ({
    label: item.label,
    value: row?.[item.key] ?? "-",
  }));

const paginate = (rows, page, size = rowsPerPage) => {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * size;
  return {
    rows: rows.slice(start, start + size),
    total,
    pages,
    page: safePage,
  };
};

const SettingsManagement = () => {
  const { faculty } = useAuth();
  const isAdmin = Boolean(faculty?.isAdmin);

  const {
    getAllFaculties,
    getAllStudents,
    updateFaculty,
    deleteFaculty,
    updateStudent,
    deleteStudent,
  } = useAdmin();

  const {
    getBatchOptions,
    getSettingsBatches,
    updateSettingsBatch,
    deleteSettingsBatch,
  } = useBatch();

  const {
    getSettingsAssignments,
    updateSettingsAssignment,
    updateSettingsAssignmentDeadline,
    deleteSettingsAssignment,
  } = useAssignment();

  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [batchOptions, setBatchOptions] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);
  const [modalFormData, setModalFormData] = useState({});
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [activeSection, setActiveSection] = useState(isAdmin ? "users" : "batches");
  const [activeUserTable, setActiveUserTable] = useState("students");
  const [searchText, setSearchText] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  const [facultyPage, setFacultyPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [batchPage, setBatchPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);

  const isStudentView = isAdmin && activeSection === "users" && activeUserTable === "students";
  const isFacultyView = isAdmin && activeSection === "users" && activeUserTable === "faculties";
  const isBatchView = activeSection === "batches";
  const isAssignmentView = activeSection === "assignments";

  const batchLabelById = useMemo(() => {
    const map = new Map();
    batches.forEach((batch) => {
      map.set(
        batch.batchId,
        `${batch.batchName || batch.baseBatch || "-"} / ${batch.yearLabel || `Year ${batch.year}`} / ${batch.division || "-"} / ${batch.subjectName || "-"}`
      );
    });
    return map;
  }, [batches]);

  const studentYearOptions = useMemo(() => {
    const values = new Set();
    students.forEach((item) => {
      if (item?.year != null) values.add(String(item.year));
    });
    return Array.from(values).sort((a, b) => Number(a) - Number(b));
  }, [students]);

  const studentDivisionOptions = useMemo(() => {
    const values = new Set();
    students.forEach((item) => {
      if (!item?.division) return;
      if (yearFilter !== "all" && String(item.year) !== yearFilter) return;
      values.add(String(item.division));
    });
    return Array.from(values).sort();
  }, [students, yearFilter]);

  const studentBatchOptions = useMemo(() => {
    const values = new Set();
    students.forEach((item) => {
      if (!item?.baseBatch) return;
      if (yearFilter !== "all" && String(item.year) !== yearFilter) return;
      if (divisionFilter !== "all" && String(item.division) !== divisionFilter) return;
      values.add(String(item.baseBatch));
    });
    return Array.from(values).sort().map((value) => ({ value, label: value }));
  }, [students, yearFilter, divisionFilter]);

  const batchYearOptions = useMemo(() => {
    const values = new Set();
    batches.forEach((item) => {
      if (item?.year != null) values.add(String(item.year));
    });
    return Array.from(values).sort((a, b) => Number(a) - Number(b));
  }, [batches]);

  const batchDivisionOptions = useMemo(() => {
    const values = new Set();
    batches.forEach((item) => {
      if (!item?.division) return;
      if (yearFilter !== "all" && String(item.year) !== yearFilter) return;
      values.add(String(item.division));
    });
    return Array.from(values).sort();
  }, [batches, yearFilter]);

  const batchBaseOptions = useMemo(() => {
    const values = new Set();
    batches.forEach((item) => {
      const batchName = item.batchName || item.baseBatch;
      if (!batchName) return;
      if (yearFilter !== "all" && String(item.year) !== yearFilter) return;
      if (divisionFilter !== "all" && String(item.division) !== divisionFilter) return;
      values.add(String(batchName));
    });
    return Array.from(values).sort().map((value) => ({ value, label: value }));
  }, [batches, yearFilter, divisionFilter]);

  const assignmentYearOptions = useMemo(() => {
    const values = new Set();
    assignments.forEach((item) => {
      if (item?.year != null) values.add(String(item.year));
    });
    return Array.from(values).sort((a, b) => Number(a) - Number(b));
  }, [assignments]);

  const assignmentDivisionOptions = useMemo(() => {
    const values = new Set();
    assignments.forEach((item) => {
      if (!item?.division) return;
      if (yearFilter !== "all" && String(item.year) !== yearFilter) return;
      values.add(String(item.division));
    });
    return Array.from(values).sort();
  }, [assignments, yearFilter]);

  const assignmentBatchOptions = useMemo(() => {
    const values = new Set();
    assignments.forEach((item) => {
      if (!item?.baseBatch) return;
      if (yearFilter !== "all" && String(item.year) !== yearFilter) return;
      if (divisionFilter !== "all" && String(item.division) !== divisionFilter) return;
      values.add(String(item.baseBatch));
    });
    return Array.from(values).sort().map((value) => ({ value, label: value }));
  }, [assignments, yearFilter, divisionFilter]);

  const currentYearOptions = isStudentView
    ? studentYearOptions
    : isBatchView
      ? batchYearOptions
      : isAssignmentView
        ? assignmentYearOptions
        : [];

  const currentDivisionOptions = isStudentView
    ? studentDivisionOptions
    : isBatchView
      ? batchDivisionOptions
      : isAssignmentView
        ? assignmentDivisionOptions
        : [];

  const currentBatchOptions = isStudentView
    ? studentBatchOptions
    : isBatchView
      ? batchBaseOptions
      : isAssignmentView
        ? assignmentBatchOptions
        : [];

  const editBatchYearOptions = useMemo(() => {
    if (!batchOptions?.yearDivisions) return [];
    return Object.keys(batchOptions.yearDivisions)
      .map(Number)
      .sort((a, b) => a - b)
      .map((year) => ({
        value: String(year),
        label: batchOptions?.yearLabels?.[String(year)] || `Year ${year}`,
      }));
  }, [batchOptions]);

  const semesterOptions = useMemo(() => {
    if (!batchOptions?.thirdYearSubjectsBySemester) return [];
    return Object.keys(batchOptions.thirdYearSubjectsBySemester)
      .map(Number)
      .sort((a, b) => a - b)
      .map((semester) => ({
        value: String(semester),
        label: `Semester ${semester}`,
      }));
  }, [batchOptions]);

  const assignmentBatchSelectOptions = useMemo(
    () =>
      batches.map((batch) => ({
        value: batch.batchId,
        label:
          batchLabelById.get(batch.batchId) ||
          `${batch.batchName || batch.baseBatch || "-"} / ${batch.yearLabel || `Year ${batch.year}`} / ${batch.division || "-"}`,
      })),
    [batches, batchLabelById]
  );

  const filteredFaculties = useMemo(
    () => faculties.filter((row) =>
      [row.name, row.email, row.createdAt].some((value) => includesSearch(value, searchText))
    ),
    [faculties, searchText]
  );

  const filteredStudents = useMemo(
    () =>
      students.filter((row) => {
        const searchMatch = [row.rollNo, row.name, row.email, row.department, row.baseBatch, row.division, row.year].some((value) =>
          includesSearch(value, searchText)
        );
        const yearMatch = yearFilter === "all" || String(row.year) === yearFilter;
        const divisionMatch = divisionFilter === "all" || String(row.division) === divisionFilter;
        const batchMatch = batchFilter === "all" || String(row.baseBatch || "") === batchFilter;
        return searchMatch && yearMatch && divisionMatch && batchMatch;
      }),
    [students, searchText, yearFilter, divisionFilter, batchFilter]
  );

  const filteredBatches = useMemo(
    () =>
      batches.filter((row) => {
        const searchMatch = [row.batchName, row.baseBatch, row.subjectName, row.division, row.yearLabel, row.year].some((value) =>
          includesSearch(value, searchText)
        );
        const yearMatch = yearFilter === "all" || String(row.year) === yearFilter;
        const divisionMatch = divisionFilter === "all" || String(row.division) === divisionFilter;
        const rowBatch = String(row.batchName || row.baseBatch || "");
        const batchMatch = batchFilter === "all" || rowBatch === batchFilter;
        return searchMatch && yearMatch && divisionMatch && batchMatch;
      }),
    [batches, searchText, yearFilter, divisionFilter, batchFilter]
  );

  const filteredAssignments = useMemo(
    () =>
      assignments.filter((row) => {
        const searchMatch = [row.title, row.description, row.baseBatch, row.division, row.subjectName, row.yearLabel, batchLabelById.get(row.batchId)].some((value) =>
          includesSearch(value, searchText)
        );
        const yearMatch = yearFilter === "all" || String(row.year) === yearFilter;
        const divisionMatch = divisionFilter === "all" || String(row.division) === divisionFilter;
        const batchMatch = batchFilter === "all" || String(row.baseBatch || "") === batchFilter;
        return searchMatch && yearMatch && divisionMatch && batchMatch;
      }),
    [assignments, searchText, yearFilter, divisionFilter, batchFilter, batchLabelById]
  );

  const facultyPageData = useMemo(() => paginate(filteredFaculties, facultyPage), [filteredFaculties, facultyPage]);
  const studentPageData = useMemo(() => paginate(filteredStudents, studentPage), [filteredStudents, studentPage]);
  const batchPageData = useMemo(() => paginate(filteredBatches, batchPage), [filteredBatches, batchPage]);
  const assignmentPageData = useMemo(() => paginate(filteredAssignments, assignmentPage), [filteredAssignments, assignmentPage]);

  const loadAll = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const tasks = [getSettingsBatches(), getSettingsAssignments(), getBatchOptions()];
      if (isAdmin) {
        tasks.push(getAllFaculties(), getAllStudents());
      }

      const results = await Promise.all(tasks);

      setBatches(results[0] || []);
      setAssignments(results[1] || []);
      setBatchOptions(results[2] || null);

      if (isAdmin) {
        setFaculties(results[3] || []);
        setStudents(results[4] || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load settings data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    setFacultyPage(1);
    setStudentPage(1);
    setBatchPage(1);
    setAssignmentPage(1);
  }, [searchText, yearFilter, divisionFilter, batchFilter, activeSection, activeUserTable]);

  useEffect(() => {
    if (!isStudentView) return;
    if (yearFilter !== "all" && !studentYearOptions.includes(yearFilter)) {
      setYearFilter("all");
      return;
    }
    if (divisionFilter !== "all" && !studentDivisionOptions.includes(divisionFilter)) {
      setDivisionFilter("all");
      return;
    }
    if (batchFilter !== "all" && !studentBatchOptions.some((item) => item.value === batchFilter)) {
      setBatchFilter("all");
    }
  }, [isStudentView, yearFilter, divisionFilter, batchFilter, studentYearOptions, studentDivisionOptions, studentBatchOptions]);

  useEffect(() => {
    setYearFilter("all");
    setDivisionFilter("all");
    setBatchFilter("all");
  }, [activeSection, activeUserTable]);

  const renderPagination = (data, onPageChange) => (
    <div className="flex items-center justify-between border-t border-gray-700 bg-[#0F1114] px-4 py-3">
      <p className="text-xs text-gray-500">
        Showing {data.total === 0 ? 0 : (data.page - 1) * rowsPerPage + 1}-{Math.min(data.page * rowsPerPage, data.total)} of {data.total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, data.page - 1))}
          disabled={data.page <= 1}
          className="rounded-lg border border-gray-600 px-3 py-1 text-xs text-gray-300 transition hover:bg-[#2A2F36] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-xs text-gray-400">{data.page} / {data.pages}</span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(data.pages, data.page + 1))}
          disabled={data.page >= data.pages}
          className="rounded-lg border border-gray-600 px-3 py-1 text-xs text-gray-300 transition hover:bg-[#2A2F36] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  const closeModal = () => {
    if (modalSubmitting) return;
    setModalConfig(null);
    setModalFormData({});
  };

  const openFormModal = (config) => {
    setModalConfig({
      mode: "form",
      title: config.title,
      subtitle: config.subtitle || "",
      previewRows: config.previewRows || [],
      maxWidth: config.maxWidth || "max-w-lg",
      fields: config.fields || [],
      confirmText: config.confirmText || "Save",
      onConfirm: config.onConfirm,
      successText: config.successText,
      destructive: false,
    });
    setModalFormData(config.initialData || {});
  };

  const openConfirmModal = (config) => {
    setModalConfig({
      mode: "confirm",
      title: config.title,
      subtitle: config.subtitle || "",
      confirmText: config.confirmText || "Confirm",
      onConfirm: config.onConfirm,
      successText: config.successText,
      destructive: Boolean(config.destructive),
    });
    setModalFormData({});
  };

  const executeAction = async (operation, successText) => {
    setError(null);
    setMessage(null);
    setModalSubmitting(true);
    setLoading(true);
    try {
      await operation();
      setMessage(successText);
      await loadAll();
      closeModal();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setModalSubmitting(false);
      setLoading(false);
    }
  };

  const onModalSubmit = async (event) => {
    event.preventDefault();
    if (!modalConfig?.onConfirm) return;
    await executeAction(() => modalConfig.onConfirm(modalFormData), modalConfig.successText || "Saved successfully.");
  };

  const onEditFaculty = (row) => {
    openFormModal({
      title: "Edit Faculty",
      subtitle: "Update faculty details.",
      previewRows: toPreviewRows(row, [
        { label: "Current Name", key: "name" },
        { label: "Current Email", key: "email" },
      ]),
      maxWidth: "max-w-4xl",
      confirmText: "Save Faculty",
      successText: "Faculty updated successfully.",
      initialData: {
        name: row.name || "",
        email: row.email || "",
      },
      fields: [
        { name: "name", label: "Faculty Name", type: "text", required: true, placeholder: "Enter faculty name" },
        { name: "email", label: "Faculty Email", type: "email", required: true, placeholder: "Enter faculty email" },
      ],
      onConfirm: (data) => updateFaculty(row.id, { name: (data.name || "").trim(), email: (data.email || "").trim() }),
    });
  };

  const onDeleteFaculty = (row) => {
    openConfirmModal({
      title: "Delete Faculty",
      subtitle: `Delete ${row.name}? This action cannot be undone.`,
      confirmText: "Delete Faculty",
      successText: "Faculty deleted successfully.",
      destructive: true,
      onConfirm: () => deleteFaculty(row.id),
    });
  };

  const onEditStudent = (row) => {
    openFormModal({
      title: "Edit Student",
      subtitle: "Update student profile details.",
      previewRows: [
        { label: "Current Roll Number", value: row.rollNo || "-" },
        { label: "Current Name", value: row.name || "-" },
        { label: "Current Email", value: row.email || "-" },
        { label: "Current Department", value: row.department || "-" },
        { label: "Current Year", value: row.year || "-" },
        { label: "Current Division", value: row.division || "-" },
        { label: "Current Batch", value: row.baseBatch || "-" },
      ],
      maxWidth: "max-w-5xl",
      confirmText: "Save Student",
      successText: "Student updated successfully.",
      initialData: {
        rollNo: row.rollNo || "",
        name: row.name || "",
        email: row.email || "",
        department: row.department || "",
        year: row.year ?? "",
        division: row.division || "",
        baseBatch: row.baseBatch || "",
      },
      fields: [
        { name: "rollNo", label: "Roll Number", type: "text", required: true },
        { name: "name", label: "Student Name", type: "text", required: true },
        { name: "email", label: "Student Email", type: "email", required: true },
        { name: "department", label: "Department", type: "text", required: true },
        { name: "year", label: "Year", type: "number", required: true, min: 1, max: 6 },
        { name: "division", label: "Division", type: "text", required: true },
        { name: "baseBatch", label: "Batch", type: "text", required: true },
      ],
      onConfirm: (data) => {
        const year = Number(data.year);
        if (!Number.isFinite(year)) {
          throw new Error("Year must be a valid number.");
        }
        return updateStudent(row.id, {
          rollNo: (data.rollNo || "").trim(),
          name: (data.name || "").trim(),
          email: (data.email || "").trim(),
          department: (data.department || "").trim(),
          year,
          division: (data.division || "").trim(),
          baseBatch: (data.baseBatch || "").trim(),
        });
      },
    });
  };

  const onDeleteStudent = (row) => {
    openConfirmModal({
      title: "Delete Student",
      subtitle: `Delete ${row.name}? This action cannot be undone.`,
      confirmText: "Delete Student",
      successText: "Student deleted successfully.",
      destructive: true,
      onConfirm: () => deleteStudent(row.id),
    });
  };

  const onEditBatch = (row) => {
    const defaultSemester = inferSemesterForSubject(row.subjectName, batchOptions);

    openFormModal({
      title: "Edit Batch",
      subtitle: "Update batch details using the same flow as create batch.",
      previewRows: [
        { label: "Current Batch", value: row.batchName || row.baseBatch || "-" },
        { label: "Current Year", value: row.yearLabel || row.year || "-" },
        { label: "Current Division", value: row.division || "-" },
        { label: "Current Subject", value: row.subjectName || "-" },
      ],
      maxWidth: "max-w-5xl",
      confirmText: "Save Batch",
      successText: "Batch updated successfully.",
      initialData: {
        baseBatch: row.batchName || row.baseBatch || "",
        year: row.year != null ? String(row.year) : "",
        division: row.division || "",
        subjectName: row.subjectName || "",
        semester: defaultSemester,
      },
      fields: [
        {
          name: "year",
          label: "Year",
          type: "select",
          required: true,
          options: editBatchYearOptions,
          onValueChange: () => ({ division: "", baseBatch: "", semester: "", subjectName: "" }),
        },
        {
          name: "division",
          label: "Division",
          type: "select",
          required: true,
          options: (formData) => {
            if (!formData.year || !batchOptions?.yearDivisions) return [];
            const values =
              batchOptions.yearDivisions[String(formData.year)] ||
              batchOptions.yearDivisions[Number(formData.year)] ||
              [];
            return values.map((value) => ({ value, label: value }));
          },
          onValueChange: () => ({ baseBatch: "" }),
        },
        {
          name: "baseBatch",
          label: "Batch Name",
          type: "select",
          required: true,
          options: (formData) => {
            if (!formData.division || !batchOptions?.divisionBaseBatches) return [];
            const values = batchOptions.divisionBaseBatches[formData.division] || [];
            return values.map((value) => ({ value, label: value }));
          },
        },
        {
          name: "semester",
          label: "Semester",
          type: "select",
          required: true,
          options: semesterOptions,
          onValueChange: () => ({ subjectName: "" }),
        },
        {
          name: "subjectName",
          label: "Subject",
          type: "select",
          required: true,
          options: (formData) => {
            if (String(formData.year) !== "3") return [];
            if (!formData.semester || !batchOptions?.thirdYearSubjectsBySemester) return [];
            const values =
              batchOptions.thirdYearSubjectsBySemester[String(formData.semester)] ||
              batchOptions.thirdYearSubjectsBySemester[Number(formData.semester)] ||
              [];
            return values.map((value) => ({ value, label: value }));
          },
        },
      ],
      onConfirm: (data) => {
        const year = Number(data.year);
        const semester = Number(data.semester);
        if (!Number.isFinite(year)) {
          throw new Error("Year must be a valid number.");
        }
        if (!Number.isFinite(semester)) {
          throw new Error("Semester must be selected.");
        }
        return updateSettingsBatch(row.batchId, {
          year,
          division: (data.division || "").trim(),
          baseBatch: (data.baseBatch || "").trim(),
          semester,
          subjectName: (data.subjectName || "").trim(),
        });
      },
    });
  };

  const onDeleteBatch = (row) => {
    openConfirmModal({
      title: "Delete Batch",
      subtitle: `Delete ${row.batchName || row.baseBatch}? This action cannot be undone.`,
      confirmText: "Delete Batch",
      successText: "Batch deleted successfully.",
      destructive: true,
      onConfirm: () => deleteSettingsBatch(row.batchId),
    });
  };

  const onEditAssignment = (row) => {
    openFormModal({
      title: "Edit Assignment",
      subtitle: "Update assignment details using the same flow as create assignment.",
      previewRows: [
        { label: "Current Title", value: row.title || "-" },
        { label: "Current Batch", value: batchLabelById.get(row.batchId) || row.baseBatch || "-" },
        { label: "Current Deadline", value: formatDateTime(row.deadline) },
        { label: "Allow Multiple", value: row.allowMultipleSubmissions ? "Yes" : "No" },
        { label: "Similarity Detection", value: row.enableSimilarityDetection ? "Enabled" : "Disabled" },
        { label: "AI Detection", value: row.enableAiDetection ? "Enabled" : "Disabled" },
      ],
      maxWidth: "max-w-5xl",
      confirmText: "Save Assignment",
      successText: "Assignment updated successfully.",
      initialData: {
        title: row.title || "",
        description: row.description || "",
        batchId: row.batchId || "",
        deadline: toDateTimeLocalValue(row.deadline).slice(0, 10),
        allowMultipleSubmissions: Boolean(row.allowMultipleSubmissions),
        enableSimilarityDetection: Boolean(row.enableSimilarityDetection),
        enableAiDetection: Boolean(row.enableAiDetection),
      },
      fields: [
        {
          name: "batchId",
          label: "Batch",
          type: "select",
          required: true,
          options: assignmentBatchSelectOptions,
        },
        { name: "title", label: "Assignment Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: false },
        {
          name: "deadline",
          label: "Submission Deadline",
          type: "date",
          required: true,
        },
        {
          name: "allowMultipleSubmissions",
          label: "Allow multiple submissions",
          type: "checkbox",
        },
        {
          name: "enableSimilarityDetection",
          label: "Enable code similarity detection",
          type: "checkbox",
        },
        {
          name: "enableAiDetection",
          label: "Enable AI generated code detection",
          type: "checkbox",
        },
      ],
      onConfirm: (data) => {
        const parsedDeadline = new Date(`${data.deadline}T23:59:59`);
        if (Number.isNaN(parsedDeadline.getTime())) {
          throw new Error("Invalid deadline format.");
        }
        return updateSettingsAssignment(row.assignmentId, {
          batchId: (data.batchId || "").trim(),
          title: (data.title || "").trim(),
          description: (data.description || "").trim(),
          deadline: parsedDeadline.toISOString(),
          allowMultipleSubmissions: Boolean(data.allowMultipleSubmissions),
          enableSimilarityDetection: Boolean(data.enableSimilarityDetection),
          enableAiDetection: Boolean(data.enableAiDetection),
        });
      },
    });
  };

  const onDeleteAssignment = (row) => {
    openConfirmModal({
      title: "Delete Assignment",
      subtitle: `Delete ${row.title}? This action cannot be undone.`,
      confirmText: "Delete Assignment",
      successText: "Assignment deleted successfully.",
      destructive: true,
      onConfirm: () => deleteSettingsAssignment(row.assignmentId),
    });
  };

  const onChangeDeadline = (row) => {
    openFormModal({
      title: "Change Deadline",
      subtitle: `Update deadline for ${row.title}.`,
      previewRows: [
        { label: "Assignment", value: row.title || "-" },
        { label: "Current Deadline", value: formatDateTime(row.deadline) },
      ],
      maxWidth: "max-w-4xl",
      confirmText: "Save Deadline",
      successText: "Assignment deadline updated successfully.",
      initialData: {
        deadline: toDateTimeLocalValue(row.deadline),
      },
      fields: [
        { name: "deadline", label: "Deadline", type: "datetime-local", required: true },
      ],
      onConfirm: (data) => {
        const parsed = new Date(data.deadline);
        if (Number.isNaN(parsed.getTime())) {
          throw new Error("Invalid deadline format.");
        }
        return updateSettingsAssignmentDeadline(row.assignmentId, parsed.toISOString());
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#F3F4F6]">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Modify or delete system entities.</p>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-gray-700 text-gray-400 hover:bg-[#2A2F36] hover:text-[#F3F4F6] transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <div className="px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-sm text-[#F87171]">{error}</div>}
      {message && <div className="px-4 py-3 rounded-xl bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-sm text-[#00C2FF]">{message}</div>}

      <section className="space-y-4">
        <div className="rounded-2xl border border-gray-700 bg-[#1C1F23] px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveSection("users")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  activeSection === "users"
                    ? "border-[#00C2FF]/60 bg-[#00C2FF]/10 text-[#00C2FF]"
                    : "border-gray-600 text-gray-300 hover:bg-[#2A2F36]"
                }`}
              >
                Users
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSection("batches")}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                activeSection === "batches"
                  ? "border-[#00C2FF]/60 bg-[#00C2FF]/10 text-[#00C2FF]"
                  : "border-gray-600 text-gray-300 hover:bg-[#2A2F36]"
              }`}
            >
              Batches
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("assignments")}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                activeSection === "assignments"
                  ? "border-[#00C2FF]/60 bg-[#00C2FF]/10 text-[#00C2FF]"
                  : "border-gray-600 text-gray-300 hover:bg-[#2A2F36]"
              }`}
            >
              Assignments
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={
                isFacultyView
                  ? "Search by faculty name or email..."
                  : isStudentView
                    ? "Search by roll no, name, email, batch..."
                    : isBatchView
                      ? "Search by batch or subject..."
                      : "Search by title, description, batch..."
              }
              className={`w-full rounded-xl border border-gray-600 bg-[#0F1114] px-3 py-2 text-sm text-[#F3F4F6] outline-none transition focus:border-[#00C2FF]/70 ${
                isFacultyView ? "xl:col-span-6" : "xl:col-span-2"
              }`}
            />

            {!isFacultyView && (
              <>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full rounded-xl border border-gray-600 bg-[#0F1114] px-3 py-2 text-sm text-[#F3F4F6] outline-none transition focus:border-[#00C2FF]/70"
                >
                  <option value="all">All Years</option>
                  {currentYearOptions.map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>

                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="w-full rounded-xl border border-gray-600 bg-[#0F1114] px-3 py-2 text-sm text-[#F3F4F6] outline-none transition focus:border-[#00C2FF]/70"
                >
                  <option value="all">All Divisions</option>
                  {currentDivisionOptions.map((division) => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>

                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full rounded-xl border border-gray-600 bg-[#0F1114] px-3 py-2 text-sm text-[#F3F4F6] outline-none transition focus:border-[#00C2FF]/70"
                >
                  <option value="all">All Batches</option>
                  {currentBatchOptions.map((batch) => (
                    <option key={batch.value} value={batch.value}>{batch.label}</option>
                  ))}
                </select>
              </>
            )}

          </div>
        </div>

        {isAdmin && activeSection === "users" && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveUserTable("students")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  activeUserTable === "students"
                    ? "border-[#00C2FF]/60 bg-[#00C2FF]/10 text-[#00C2FF]"
                    : "border-gray-600 text-gray-300 hover:bg-[#2A2F36]"
                }`}
              >
                Students ({filteredStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveUserTable("faculties")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  activeUserTable === "faculties"
                    ? "border-[#00C2FF]/60 bg-[#00C2FF]/10 text-[#00C2FF]"
                    : "border-gray-600 text-gray-300 hover:bg-[#2A2F36]"
                }`}
              >
                Faculties ({filteredFaculties.length})
              </button>
            </div>

            {activeUserTable === "faculties" && (
              <div className={sectionCard}>
                <div className="max-h-[520px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-[#0F1114]">
                      <tr className="border-b border-gray-700">
                        <th className={tableHead}>Faculty Name</th>
                        <th className={tableHead}>Email</th>
                        <th className={tableHead}>Created At</th>
                        <th className={tableHead}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyPageData.rows.map((row) => (
                        <tr key={row.id} className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors">
                          <td className="px-6 py-4 text-[#F3F4F6] font-medium">{row.name}</td>
                          <td className="px-6 py-4 text-gray-400">{row.email}</td>
                          <td className="px-6 py-4 text-gray-500">{formatDateTime(row.createdAt)}</td>
                          <td className="px-6 py-4 space-x-2">
                            <button onClick={() => onEditFaculty(row)} className={`${actionBtn} border-[#00C2FF]/50 text-[#00C2FF] hover:bg-[#00C2FF]/10`}>Edit Faculty</button>
                            <button onClick={() => onDeleteFaculty(row)} className={`${actionBtn} border-[#F87171]/50 text-[#F87171] hover:bg-[#F87171]/10`}>Delete Faculty</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(facultyPageData, setFacultyPage)}
              </div>
            )}

            {activeUserTable === "students" && (
              <div className={sectionCard}>
                <div className="max-h-[520px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-[#0F1114]">
                      <tr className="border-b border-gray-700">
                        <th className={tableHead}>Roll Number</th>
                        <th className={tableHead}>Student Name</th>
                        <th className={tableHead}>Department</th>
                        <th className={tableHead}>Batch</th>
                        <th className={tableHead}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPageData.rows.map((row) => (
                        <tr key={row.id} className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors">
                          <td className="px-6 py-4 text-gray-400 font-mono text-xs">{row.rollNo}</td>
                          <td className="px-6 py-4 text-[#F3F4F6] font-medium">{row.name}</td>
                          <td className="px-6 py-4 text-gray-400">{row.department || "-"}</td>
                          <td className="px-6 py-4 text-gray-400">{row.baseBatch || "-"}</td>
                          <td className="px-6 py-4 space-x-2">
                            <button onClick={() => onEditStudent(row)} className={`${actionBtn} border-[#00C2FF]/50 text-[#00C2FF] hover:bg-[#00C2FF]/10`}>Edit Student</button>
                            <button onClick={() => onDeleteStudent(row)} className={`${actionBtn} border-[#F87171]/50 text-[#F87171] hover:bg-[#F87171]/10`}>Delete Student</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(studentPageData, setStudentPage)}
              </div>
            )}
          </section>
        )}

        {activeSection === "batches" && (
          <section className="space-y-4">
            <div className={sectionCard}>
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[#0F1114]">
                    <tr className="border-b border-gray-700">
                      <th className={tableHead}>Batch Name</th>
                      <th className={tableHead}>Year</th>
                      <th className={tableHead}>Division</th>
                      <th className={tableHead}>Subject</th>
                      <th className={tableHead}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchPageData.rows.map((row) => (
                      <tr key={row.batchId} className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors">
                        <td className="px-6 py-4 text-[#F3F4F6] font-medium">{row.batchName || row.baseBatch}</td>
                        <td className="px-6 py-4 text-gray-400">{row.yearLabel || row.year}</td>
                        <td className="px-6 py-4 text-gray-400">{row.division}</td>
                        <td className="px-6 py-4 text-gray-400">{row.subjectName}</td>
                        <td className="px-6 py-4 space-x-2">
                          <button onClick={() => onEditBatch(row)} className={`${actionBtn} border-[#00C2FF]/50 text-[#00C2FF] hover:bg-[#00C2FF]/10`}>Edit Batch</button>
                          <button onClick={() => onDeleteBatch(row)} className={`${actionBtn} border-[#F87171]/50 text-[#F87171] hover:bg-[#F87171]/10`}>Delete Batch</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(batchPageData, setBatchPage)}
            </div>
          </section>
        )}

        {activeSection === "assignments" && (
          <section className="space-y-4">
            <div className={sectionCard}>
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[#0F1114]">
                    <tr className="border-b border-gray-700">
                      <th className={tableHead}>Assignment Title</th>
                      <th className={tableHead}>Batch</th>
                      <th className={tableHead}>Deadline</th>
                      <th className={tableHead}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentPageData.rows.map((row) => (
                      <tr key={row.assignmentId} className="border-t border-gray-700 hover:bg-[#2A2F36] transition-colors">
                        <td className="px-6 py-4 text-[#F3F4F6] font-medium">{row.title}</td>
                        <td className="px-6 py-4 text-gray-400">{batchLabelById.get(row.batchId) || `${row.yearLabel || "-"} / ${row.division || "-"} / ${row.baseBatch || "-"}`}</td>
                        <td className="px-6 py-4 text-[#F59E0B]">{formatDateTime(row.deadline)}</td>
                        <td className="px-6 py-4 space-x-2">
                          <button onClick={() => onEditAssignment(row)} className={`${actionBtn} border-[#00C2FF]/50 text-[#00C2FF] hover:bg-[#00C2FF]/10`}>Edit Assignment</button>
                          <button onClick={() => onDeleteAssignment(row)} className={`${actionBtn} border-[#F87171]/50 text-[#F87171] hover:bg-[#F87171]/10`}>Delete Assignment</button>
                          <button onClick={() => onChangeDeadline(row)} className={`${actionBtn} border-[#F59E0B]/50 text-[#F59E0B] hover:bg-[#F59E0B]/10`}>Change Deadline</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(assignmentPageData, setAssignmentPage)}
            </div>
          </section>
        )}
      </section>

      {modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className={`w-full ${modalConfig.maxWidth || "max-w-lg"} rounded-2xl border border-gray-700 bg-[#1C1F23] shadow-2xl`}>
            <div className="border-b border-gray-700 px-6 py-4">
              <h4 className="text-lg font-semibold text-[#F3F4F6]">{modalConfig.title}</h4>
              {modalConfig.subtitle && (
                <p className="mt-1 text-sm text-gray-400">{modalConfig.subtitle}</p>
              )}
            </div>

            <form onSubmit={onModalSubmit} className="px-6 py-5 space-y-4">
              <div className={modalConfig.mode === "form" && modalConfig.previewRows?.length ? "grid grid-cols-1 gap-5 lg:grid-cols-2" : "grid grid-cols-1"}>
                {modalConfig.mode === "form" && modalConfig.previewRows?.length > 0 && (
                  <div className="rounded-xl border border-[#00C2FF]/25 bg-[#00C2FF]/5 p-4">
                    <h5 className="text-sm font-semibold text-[#F3F4F6]">Current Info</h5>
                    <div className="mt-3 divide-y divide-gray-700/60 rounded-lg border border-gray-700/60 bg-[#0F1114]/70">
                      {modalConfig.previewRows.map((item) => (
                        <div key={item.label} className="grid grid-cols-[150px_1fr] gap-3 px-3 py-2.5 text-xs">
                          <span className="self-start uppercase tracking-wide text-gray-500">{item.label}</span>
                          <span className="break-words text-gray-200">{String(item.value || "-")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {modalConfig.mode === "form" && (
                  <div className="space-y-4">
                    {modalConfig.fields.map((field) => {
                      const selectOptions = typeof field.options === "function" ? field.options(modalFormData) : (field.options || []);
                      const isDateField = field.type === "date" || field.type === "datetime-local";

                      return (
                        <div key={field.name} className="space-y-1.5">
                          {field.type !== "checkbox" && (
                            <label className="block text-xs uppercase tracking-wide text-gray-500">
                              {field.label}
                            </label>
                          )}

                          {field.type === "textarea" ? (
                            <textarea
                              value={modalFormData[field.name] ?? ""}
                              onChange={(e) =>
                                setModalFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                              }
                              required={field.required}
                              rows={4}
                              className="w-full rounded-xl border border-gray-600 bg-[#0F1114] px-3 py-2 text-sm text-[#F3F4F6] outline-none transition focus:border-[#00C2FF]/70"
                            />
                          ) : field.type === "select" ? (
                            <select
                              value={modalFormData[field.name] ?? ""}
                              onChange={(e) => {
                                const nextValue = e.target.value;
                                setModalFormData((prev) => {
                                  const next = { ...prev, [field.name]: nextValue };
                                  if (typeof field.onValueChange === "function") {
                                    return { ...next, ...field.onValueChange(nextValue, next) };
                                  }
                                  return next;
                                });
                              }}
                              required={field.required}
                              className="w-full rounded-xl border border-gray-600 bg-[#0F1114] px-3 py-2 text-sm text-[#F3F4F6] outline-none transition focus:border-[#00C2FF]/70"
                            >
                              <option value="">Select an option</option>
                              {selectOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : field.type === "checkbox" ? (
                            <label className="flex items-center gap-3 rounded-xl border border-gray-700 bg-[#14171B] px-3 py-2 text-sm text-gray-300">
                              <input
                                type="checkbox"
                                checked={Boolean(modalFormData[field.name])}
                                onChange={(e) =>
                                  setModalFormData((prev) => ({ ...prev, [field.name]: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-[#00C2FF]"
                              />
                              {field.label}
                            </label>
                          ) : (
                            <div className={isDateField ? "relative" : ""}>
                              <input
                                type={field.type || "text"}
                                value={modalFormData[field.name] ?? ""}
                                onChange={(e) =>
                                  setModalFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                                }
                                required={field.required}
                                min={field.min}
                                max={field.max}
                                placeholder={field.placeholder}
                                style={isDateField ? { colorScheme: "dark" } : undefined}
                                className={`w-full rounded-xl border border-gray-600 bg-[#0F1114] px-3 py-2 text-sm text-[#F3F4F6] outline-none transition focus:border-[#00C2FF]/70 ${
                                  isDateField
                                    ? "pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
                                    : ""
                                }`}
                              />
                              {isDateField && (
                                <CalendarDays
                                  size={16}
                                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {modalConfig.mode === "confirm" && (
                  <div className="rounded-xl border border-gray-700 bg-[#14171B] px-4 py-3 text-sm text-gray-300">
                    {modalConfig.subtitle || "Please confirm this action."}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={modalSubmitting}
                  className="rounded-xl border border-gray-600 px-4 py-2 text-sm text-gray-300 transition hover:bg-[#2A2F36] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    modalConfig.destructive
                      ? "border border-[#F87171]/60 text-[#F87171] hover:bg-[#F87171]/10"
                      : "border border-[#00C2FF]/60 text-[#00C2FF] hover:bg-[#00C2FF]/10"
                  }`}
                >
                  {modalSubmitting ? "Processing..." : modalConfig.confirmText}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManagement;
