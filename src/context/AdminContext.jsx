import { createContext, useContext, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const apiError = (err, fallback) => {
  if (!err?.response) {
    return "Unable to reach server. Please ensure backend is running.";
  }
  return err.response?.data?.message || fallback;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestWithRetry = async (fn) => {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.response?.status;
      const transient = !err?.response || status >= 500;

      if (transient && attempt < 2) {
        await delay(300);
        continue;
      }

      throw err;
    }
  }

  return null;
};

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [pendingFaculties, setPendingFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPendingFaculties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(
          `${BASE_URL}/faculty/admin/pending-faculties`,
          { withCredentials: true }
        )
      );
      setPendingFaculties(res.data.data || []);
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to fetch pending faculties.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const approveFaculty = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.put(
          `${BASE_URL}/faculty/admin/faculty/${id}/approve`,
          {},
          { withCredentials: true }
        )
      );
      setPendingFaculties((prev) => prev.filter((f) => f.id !== id));
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to approve faculty.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const revokeFaculty = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.put(
          `${BASE_URL}/faculty/admin/faculty/${id}/revoke`,
          {},
          { withCredentials: true }
        )
      );
      setPendingFaculties((prev) => prev.filter((f) => f.id !== id));
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to revoke faculty.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const generateTempPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(
          `${BASE_URL}/faculty/admin/students/generate-temp-password`,
          { withCredentials: true }
        )
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to generate password.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.post(
          `${BASE_URL}/faculty/admin/students/create`,
          studentData,
          { withCredentials: true }
        )
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to create student.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetStudentActivation = async (email, newTempPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.post(
          `${BASE_URL}/faculty/admin/students/reset-activation`,
          { email, newTempPassword },
          { withCredentials: true }
        )
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to reset activation.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const revokeStudent = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.post(
          `${BASE_URL}/faculty/admin/students/revoke`,
          { email },
          { withCredentials: true }
        )
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to revoke student.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };
  const getAllFaculties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(
          `${BASE_URL}/faculty/admin/faculties`,
          { withCredentials: true }
        )
      );
      return res.data.data || [];
    } catch (err) {
      const msg = apiError(err, "Failed to fetch faculties.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getAllStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(
          `${BASE_URL}/faculty/admin/students`,
          { withCredentials: true }
        )
      );
      return res.data.data || [];
    } catch (err) {
      const msg = apiError(err, "Failed to fetch students.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateFaculty = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.put(
          `${BASE_URL}/faculty/admin/settings/faculties/${id}`,
          payload,
          { withCredentials: true }
        )
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to update faculty.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteFaculty = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.delete(
          `${BASE_URL}/faculty/admin/settings/faculties/${id}`,
          { withCredentials: true }
        )
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to delete faculty.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.put(
          `${BASE_URL}/faculty/admin/settings/students/${id}`,
          payload,
          { withCredentials: true }
        )
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to update student.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.delete(
          `${BASE_URL}/faculty/admin/settings/students/${id}`,
          { withCredentials: true }
        )
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to delete student.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{
      pendingFaculties,
      loading,
      error,
      getPendingFaculties,
      approveFaculty,
      revokeFaculty,
      generateTempPassword,
      createStudent,
      resetStudentActivation,
      revokeStudent,
      getAllFaculties,
      getAllStudents,
      updateFaculty,
      deleteFaculty,
      updateStudent,
      deleteStudent
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
};