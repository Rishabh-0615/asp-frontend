import { createContext, useContext, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [pendingFaculties, setPendingFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const getPendingFaculties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${BASE_URL}/faculty/admin/pending-faculties`,
        { withCredentials: true }
      );
      setPendingFaculties(res.data.data || []);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch pending faculties.";
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
      const res = await axios.put(
        `${BASE_URL}/faculty/admin/faculty/${id}/approve`,
        {},
        { withCredentials: true }
      );
      setPendingFaculties((prev) => prev.filter((f) => f.id !== id));
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to approve faculty.";
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
      const res = await axios.put(
        `${BASE_URL}/faculty/admin/faculty/${id}/revoke`,
        {},
        { withCredentials: true }
      );
      setPendingFaculties((prev) => prev.filter((f) => f.id !== id));
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to revoke faculty.";
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
      const res = await axios.get(
        `${BASE_URL}/faculty/admin/students/generate-temp-password`,
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate password.";
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
      const res = await axios.post(
        `${BASE_URL}/faculty/admin/students/create`,
        studentData,
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create student.";
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
      const res = await axios.post(
        `${BASE_URL}/faculty/admin/students/reset-activation`,
        { email, newTempPassword },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset activation.";
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
      const res = await axios.post(
        `${BASE_URL}/faculty/admin/students/revoke`,
        { email },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to revoke student.";
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
      const res = await axios.get(
        `${BASE_URL}/faculty/admin/faculties`,
        { withCredentials: true }
      );
      return res.data.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch faculties.";
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
      const res = await axios.get(
        `${BASE_URL}/faculty/admin/students`,
        { withCredentials: true }
      );
      return res.data.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch students.";
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
      getAllStudents
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