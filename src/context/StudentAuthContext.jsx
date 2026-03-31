import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const StudentAuthContext = createContext(null);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractErrorMessage = (err, fallback) => {
  if (!err?.response) {
    return "Unable to reach server. Please ensure backend is running.";
  }

  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  const status = err?.response?.status;
  if (status === 403) {
    return "Access denied. Please clear cookies once and try student login again.";
  }

  return err?.message || fallback;
};

export const StudentAuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [myBatches, setMyBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
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
  }, []);

  const fetchMyBatches = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/student/batches`, {
        withCredentials: true,
      });
      setMyBatches(response.data?.data || []);
      return response.data?.data || [];
    } catch (err) {
      setMyBatches([]);
      const errorMessage = extractErrorMessage(err, "Failed to fetch student batches");
      throw new Error(errorMessage);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      let response;

      for (let attempt = 1; attempt <= 4; attempt += 1) {
        try {
          response = await axios.post(
            `${BASE_URL}/student/login`,
            { email, password },
            { withCredentials: true }
          );
          break;
        } catch (err) {
          const status = err?.response?.status;
          const msg = err?.response?.data?.message;
          const isTransient = status >= 500 || msg === "An unexpected error occurred";

          if (isTransient && attempt < 4) {
            await delay(300 * attempt);
            continue;
          }

          throw err;
        }
      }

      if (!response) {
        throw new Error("Login failed");
      }

      if (response.data.success && response.data?.data?.activationRequired) {
        return response.data;
      }

      if (response.data.success) {
        await fetchProfile();
        return response.data;
      }

      throw new Error(response.data.message || "Login failed");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Login failed");
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${BASE_URL}/student/logout`, {}, { withCredentials: true });
      setStudent(null);
      setMyBatches([]);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  const isLoggedIn = useCallback(() => student !== null, [student]);

  const activateAccount = useCallback(async (email, tempPassword, newPassword) => {
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
      const errorMessage = extractErrorMessage(err, "Activation failed");
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return (
    <StudentAuthContext.Provider value={value}>
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
