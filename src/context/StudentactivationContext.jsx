import { createContext, useContext, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const apiError = (err, fallback) => {
  if (!err?.response) {
    return "Unable to reach server. Please ensure backend is running.";
  }
  return err.response?.data?.message || fallback;
};

const StudentActivationContext = createContext(null);

export const StudentActivationProvider = ({ children }) => {
  const [step, setStep]       = useState(1);  
  const [email, setEmail]     = useState("");  
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const initiateActivation = async (emailInput) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/student/activation/register`,
        { email: emailInput },
        { withCredentials: true }    
      );

      if (res.data.success) {
        setEmail(emailInput);         
        setStep(2);
        setSuccess(res.data.message);
      }

      return res.data;
    } catch (err) {
      const msg = apiError(err, "Activation initiation failed.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyTempPassword = async (tempPassword) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/student/activation/verify-temp-password`,
        { tempPassword },
        { withCredentials: true }    
      );

      if (res.data.success) {
        setStep(3);
        setSuccess(res.data.message);
      }

      return res.data;
    } catch (err) {
      const msg = apiError(err, "Invalid temporary password.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/student/activation/change-password`,
        { newPassword },
        { withCredentials: true }     
      );

      if (res.data.success) {
        setSuccess(res.data.message);
        setStep(4);                 
        resetFlow();
      }

      return res.data;
    } catch (err) {
      const msg = apiError(err, "Failed to set password.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getActivationStatus = async (emailToCheck) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${BASE_URL}/student/activation/status?email=${emailToCheck}`,
        { withCredentials: true }
      );
      return res.data; 
    } catch (err) {
      const msg = apiError(err, "Failed to fetch status.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setEmail("");
    setError(null);
    setSuccess(null);
  };

  return (
    <StudentActivationContext.Provider value={{
      step,
      email,
      loading,
      error,
      success,
      initiateActivation,
      verifyTempPassword,
      changePassword,
      getActivationStatus,
      resetFlow,
    }}>
      {children}
    </StudentActivationContext.Provider>
  );
};

export const useStudentActivation = () => {
  const ctx = useContext(StudentActivationContext);
  if (!ctx) throw new Error("useStudentActivation must be used inside StudentActivationProvider");
  return ctx;
};