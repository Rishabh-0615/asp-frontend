import { createContext, useContext, useState, useCallback, useMemo } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const PasswordRecoveryContext = createContext(null);

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

  return err?.message || fallback;
};

export const PasswordRecoveryProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Step 1: Request verification code for student or faculty
   * @param {string} email - User email
   * @param {string} userType - "STUDENT" or "FACULTY"
   */
  const requestVerificationCode = useCallback(async (email, userType) => {
    setError(null);
    setLoading(true);
    try {
      const endpoint = userType === "STUDENT"
        ? "/password-recovery/forgot-password/student"
        : "/password-recovery/forgot-password/faculty";

      const response = await axios.post(
        `${BASE_URL}${endpoint}`,
        { email },
        { withCredentials: true }
      );

      if (response.data.success) {
        return response.data;
      }

      throw new Error(response.data.message || "Failed to send verification code");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to send verification code");
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Step 2: Verify the 6-digit code
   * @param {string} verificationCode - 6-digit code from email
   */
  const verifyCode = useCallback(async (verificationCode) => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/password-recovery/verify-code`,
        { verificationCode },
        { withCredentials: true }
      );

      if (response.data.success) {
        return response.data;
      }

      throw new Error(response.data.message || "Failed to verify code");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to verify code");
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Step 3: Reset password with verified code
   * @param {string} verificationCode - Verified code
   * @param {string} newPassword - New password
   */
  const resetPassword = useCallback(async (verificationCode, newPassword) => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/password-recovery/reset-password`,
        { verificationCode, newPassword },
        { withCredentials: true }
      );

      if (response.data.success) {
        return response.data;
      }

      throw new Error(response.data.message || "Failed to reset password");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to reset password");
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      error,
      requestVerificationCode,
      verifyCode,
      resetPassword,
      clearError,
    }),
    [loading, error, requestVerificationCode, verifyCode, resetPassword, clearError]
  );

  return (
    <PasswordRecoveryContext.Provider value={value}>
      {children}
    </PasswordRecoveryContext.Provider>
  );
};

export const usePasswordRecovery = () => {
  const ctx = useContext(PasswordRecoveryContext);
  if (!ctx) {
    throw new Error(
      "usePasswordRecovery must be used within PasswordRecoveryProvider"
    );
  }
  return ctx;
};
