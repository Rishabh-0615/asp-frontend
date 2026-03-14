import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      const msg = err.response?.data?.message || "Registration failed.";
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
      const res = await axios.post(
        `${BASE_URL}/faculty/login`,
        { email, password },
        { withCredentials: true }
      );
      await fetchProfile();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
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
      const res = await axios.get(
        `${BASE_URL}/faculty/me`,
        { withCredentials: true }
      );
      setFaculty(res.data.success ? res.data.data : null);
    } catch (_) {
      setFaculty(null);
    }
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