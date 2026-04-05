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

const BatchContext = createContext(null);

export const BatchProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getBatchOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(`${BASE_URL}/faculty/batches/options`, {
          withCredentials: true,
        })
      );
      return res.data?.data || null;
    } catch (err) {
      const msg = apiError(err, "Failed to fetch batch options.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.post(`${BASE_URL}/faculty/batches`, payload, {
          withCredentials: true,
        })
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to create batch.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const uploadLabManual = async (assignmentId, file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await requestWithRetry(() =>
        axios.post(
          `${BASE_URL}/api/submissions/upload?assignmentId=${assignmentId}&contentType=LAB_MANUAL`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
      );

      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to upload lab manual.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const uploadBatchLabManual = async (batchId, file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await requestWithRetry(() =>
        axios.post(
          `${BASE_URL}/faculty/batches/${batchId}/lab-manual/upload`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
      );

      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to upload batch lab manual.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };


  const getMyBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(`${BASE_URL}/faculty/batches`, {
          withCredentials: true,
        })
      );
      return res.data?.data || [];
    } catch (err) {
      const msg = apiError(err, "Failed to fetch batches.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getBatchDetails = async (batchId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(`${BASE_URL}/faculty/batches/${batchId}/details`, {
          withCredentials: true,
        })
      );
      return res.data?.data || null;
    } catch (err) {
      const msg = apiError(err, "Failed to fetch batch details.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStudentBatchDetails = async (batchId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(`${BASE_URL}/student/batches/${batchId}/details`, {
          withCredentials: true,
        })
      );
      return res.data?.data || null;
    } catch (err) {
      const msg = apiError(err, "Failed to fetch student batch details.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getSettingsBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.get(`${BASE_URL}/faculty/settings/batches`, {
          withCredentials: true,
        })
      );
      return res.data?.data || [];
    } catch (err) {
      const msg = apiError(err, "Failed to fetch settings batches.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateSettingsBatch = async (batchId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.put(`${BASE_URL}/faculty/settings/batches/${batchId}`, payload, {
          withCredentials: true,
        })
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to update batch.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteSettingsBatch = async (batchId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestWithRetry(() =>
        axios.delete(`${BASE_URL}/faculty/settings/batches/${batchId}`, {
          withCredentials: true,
        })
      );
      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to delete batch.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BatchContext.Provider
      value={{
        loading,
        error,
        getBatchOptions,
        createBatch,
        uploadLabManual,
        uploadBatchLabManual,
        getMyBatches,
        getBatchDetails,
        getStudentBatchDetails,
        getSettingsBatches,
        updateSettingsBatch,
        deleteSettingsBatch,
      }}
    >
      {children}
    </BatchContext.Provider>
  );
};

export const useBatch = () => {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error("useBatch must be used inside BatchProvider");
  return ctx;
};
