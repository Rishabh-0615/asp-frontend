import { createContext, useContext, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BatchContext = createContext(null);

export const BatchProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getBatchOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/faculty/batches/options`, {
        withCredentials: true,
      });
      return res.data?.data || null;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch batch options.";
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
      const res = await axios.post(`${BASE_URL}/faculty/batches`, payload, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create batch.";
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
      const res = await axios.get(`${BASE_URL}/faculty/batches`, {
        withCredentials: true,
      });
      return res.data?.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch batches.";
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
        getMyBatches,
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
