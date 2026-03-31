import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const apiError = (err, fallback) => {
  if (!err?.response) {
    return "Unable to reach server. Please ensure backend is running.";
  }
  return err.response?.data?.message || fallback;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransient = (err) => {
  if (!err?.response) {
    return true;
  }

  const status = err.response.status;
  return status >= 500;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [faculty, setFaculty]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [initializing, setInitializing] = useState(true); // ← NEW

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/faculty/register`,
        { name, email, password },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Registration failed.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          res = await axios.post(
            `${BASE_URL}/faculty/login`,
            { email, password },
            { withCredentials: true }
          );
          break;
        } catch (err) {
          if (isTransient(err) && attempt < 3) {
            await delay(250 * attempt);
            continue;
          }

          throw err;
        }
      }

      await fetchProfile();
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Login failed.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/faculty/logout`,
        {},
        { withCredentials: true }
      );
    } catch (_) {
    } finally {
      setFaculty(null);
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      let res;

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          res = await axios.get(
            `${BASE_URL}/faculty/me`,
            { withCredentials: true }
          );
          break;
        } catch (err) {
          if (isTransient(err) && attempt < 2) {
            await delay(250);
            continue;
          }

          // Keep existing session on temporary network failure.
          if (!err?.response) {
            return;
          }

          // Clear session only on definitive auth failure.
          if (err.response.status === 401 || err.response.status === 403) {
            setFaculty(null);
          }
          return;
        }
      }

      setFaculty(res.data.success ? res.data.data : null);
    } catch (_) {}
  };

  // On mount: check session, then mark initializing = false
  useEffect(() => {
    fetchProfile().finally(() => setInitializing(false));
  }, []);

  const isAdmin    = () => faculty?.isAdmin === true;
  const isLoggedIn = () => faculty !== null;

  return (
    <AuthContext.Provider value={{
      faculty,
      loading,
      error,
      initializing, // ← exposed
      register,
      login,
      logout,
      isAdmin,
      isLoggedIn,
      fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};