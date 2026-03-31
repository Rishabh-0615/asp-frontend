import { createContext, useContext, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const AssignmentContext = createContext(null);
const CACHE_TTL_MS = 60 * 1000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestWithRetry = async (fn, maxAttempts = 2) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.response?.status;
      const transient = !err?.response || status >= 500;

      if (transient && attempt < maxAttempts) {
        await delay(300 * attempt);
        continue;
      }

      throw err;
    }
  }

  return null;
};
const apiError = (err, fallback) => {
  if (!err?.response) {
    return "Unable to reach server. Please ensure backend is running.";
  }
  return err.response?.data?.message || fallback;
};

export const AssignmentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const facultyAssignmentsCacheRef = useRef(new Map());
  const assessmentCacheRef = useRef(new Map());

  const readFreshCache = (cache, key) => {
    const entry = cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      return null;
    }
    return entry.data;
  };

  const writeCache = (cache, key, data) => {
    cache.set(key, { data, ts: Date.now() });
  };

  const fetchFacultyAssignments = useCallback(async (batchId) => {
    const res = await requestWithRetry(
      () =>
        axios.get(`${BASE_URL}/faculty/assignments`, {
          withCredentials: true,
          params: batchId ? { batchId } : {},
        }),
      2
    );
    return res.data?.data || [];
  }, []);

  const fetchAssignmentAssessment = useCallback(async (assignmentId) => {
    const res = await requestWithRetry(
      () =>
        axios.get(`${BASE_URL}/faculty/assignments/${assignmentId}/assessment`, {
          withCredentials: true,
        }),
      2
    );
    return res.data?.data || null;
  }, []);

  const createAssignment = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(
        () =>
          axios.post(`${BASE_URL}/faculty/assignments`, payload, {
            withCredentials: true,
          }),
        2
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to create assignment.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFacultyAssignments = useCallback(async (batchId, options = {}) => {
    const cacheKey = batchId || "__all__";
    const { forceRefresh = false, backgroundRefresh = false, onBackgroundData } = options;
    const cached = readFreshCache(facultyAssignmentsCacheRef.current, cacheKey);

    if (!forceRefresh && cached) {
      if (backgroundRefresh) {
        fetchFacultyAssignments(batchId)
          .then((freshData) => {
            writeCache(facultyAssignmentsCacheRef.current, cacheKey, freshData);
            if (typeof onBackgroundData === "function") {
              onBackgroundData(freshData);
            }
          })
          .catch(() => {
            // Keep cached result on silent background refresh failures.
          });
      }
      return cached;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchFacultyAssignments(batchId);
      writeCache(facultyAssignmentsCacheRef.current, cacheKey, data);
      return data;
    } catch (err) {
      const msg = apiError(err, "Failed to fetch assignments.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchFacultyAssignments]);

  const getStudentAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const res = await axios.get(`${BASE_URL}/student/assignments`, {
            withCredentials: true,
          });
          return res.data?.data || [];
        } catch (err) {
          const status = err.response?.status;
          const msg = apiError(err, "Failed to fetch assignments.");
          const transient = status >= 500 || msg === "An unexpected error occurred";

          if (transient && attempt < 2) {
            await delay(350);
            continue;
          }

          setError(msg);
          throw new Error(msg);
        }
      }

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssignmentAssessment = useCallback(async (assignmentId, options = {}) => {
    const cacheKey = String(assignmentId || "");
    const { forceRefresh = false, backgroundRefresh = false, onBackgroundData } = options;
    const cached = readFreshCache(assessmentCacheRef.current, cacheKey);

    if (!forceRefresh && cached) {
      if (backgroundRefresh) {
        fetchAssignmentAssessment(assignmentId)
          .then((freshData) => {
            writeCache(assessmentCacheRef.current, cacheKey, freshData);
            if (typeof onBackgroundData === "function") {
              onBackgroundData(freshData);
            }
          })
          .catch(() => {
            // Keep cached result on silent background refresh failures.
          });
      }
      return cached;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssignmentAssessment(assignmentId);
      writeCache(assessmentCacheRef.current, cacheKey, data);
      return data;
    } catch (err) {
      const msg = apiError(err, "Failed to fetch assignment assessment.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchAssignmentAssessment]);

  const getSettingsAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(
        () =>
          axios.get(`${BASE_URL}/faculty/settings/assignments`, {
            withCredentials: true,
          }),
        2
      );
      return res.data?.data || [];
    } catch (err) {
      const msg = apiError(err, "Failed to fetch settings assignments.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettingsAssignment = useCallback(async (assignmentId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(
        () =>
          axios.put(`${BASE_URL}/faculty/settings/assignments/${assignmentId}`, payload, {
            withCredentials: true,
          }),
        2
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to update assignment.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettingsAssignmentDeadline = useCallback(async (assignmentId, deadline) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(
        () =>
          axios.patch(
            `${BASE_URL}/faculty/settings/assignments/${assignmentId}/deadline`,
            { deadline },
            { withCredentials: true }
          ),
        2
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to update assignment deadline.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSettingsAssignment = useCallback(async (assignmentId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(
        () =>
          axios.delete(`${BASE_URL}/faculty/settings/assignments/${assignmentId}`, {
            withCredentials: true,
          }),
        2
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to delete assignment.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      loading,
      error,
      createAssignment,
      getFacultyAssignments,
      getStudentAssignments,
      getAssignmentAssessment,
      getSettingsAssignments,
      updateSettingsAssignment,
      updateSettingsAssignmentDeadline,
      deleteSettingsAssignment,
    }),
    [
      loading,
      error,
      createAssignment,
      getFacultyAssignments,
      getStudentAssignments,
      getAssignmentAssessment,
      getSettingsAssignments,
      updateSettingsAssignment,
      updateSettingsAssignmentDeadline,
      deleteSettingsAssignment,
    ]
  );

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignment = () => {
  const ctx = useContext(AssignmentContext);
  if (!ctx) throw new Error("useAssignment must be used inside AssignmentProvider");
  return ctx;
};
