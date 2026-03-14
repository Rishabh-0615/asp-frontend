import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StudentAuthContext = createContext(null);

export const StudentAuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [myBatches, setMyBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/student/me`, {
        withCredentials: true,
      });
      setStudent(response.data);
      try {
        const batchResponse = await axios.get(`${BASE_URL}/student/batches`, {
          withCredentials: true,
        });
        setMyBatches(batchResponse.data?.data || []);
      } catch (_) {
        setMyBatches([]);
      }
      setError(null);
    } catch (err) {
      setStudent(null);
      setMyBatches([]);
      // Don't set error on initial load if not logged in
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBatches = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/student/batches`, {
        withCredentials: true,
      });
      setMyBatches(response.data?.data || []);
      return response.data?.data || [];
    } catch (err) {
      setMyBatches([]);
      const errorMessage = err.response?.data?.message || "Failed to fetch student batches";
      throw new Error(errorMessage);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post(
        `${BASE_URL}/student/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success && response.data?.data?.activationRequired) {
        return response.data;
      }

      if (response.data.success) {
        await fetchProfile();
        return response.data;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/student/logout`, {}, { withCredentials: true });
      setStudent(null);
      setMyBatches([]);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isLoggedIn = () => {
    return student !== null;
  };

  const activateAccount = async (email, tempPassword, newPassword) => {
    setError(null);
    try {
      const response = await axios.post(
        `${BASE_URL}/student/activate`,
        { email, tempPassword, newPassword },
        { withCredentials: true }
      );

      if (response.data.success) {
        await fetchProfile();
        return response.data;
      }

      throw new Error(response.data.message || "Activation failed");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Activation failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        loading,
        error,
        myBatches,
        login,
        logout,
        activateAccount,
        fetchProfile,
        fetchMyBatches,
        isLoggedIn,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) {
    throw new Error(
      "useStudentAuth must be used within StudentAuthProvider"
    );
  }
  return ctx;
};
