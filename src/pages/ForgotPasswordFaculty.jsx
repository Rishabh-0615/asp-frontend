import { useState } from "react";
import { usePasswordRecovery } from "../context/PasswordRecoveryContext";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

/* ===============================
   Animated Background
================================ */
const BgPaths = () => (
  <div className="absolute inset-0">
    <svg
      className="w-full h-full text-white"
      viewBox="0 0 696 316"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5} -${189 + i * 6}C-${380 - i * 5} -${189 + i * 6} -${312 - i * 5} ${216 - i * 6} ${152 - i * 5} ${343 - i * 6}C${616 - i * 5} ${470 - i * 6} ${684 - i * 5} ${875 - i * 6} ${684 - i * 5} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
      })).map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke="currentColor"
          strokeWidth={path.width}
          strokeOpacity={0.1 + path.id * 0.03}
          initial={{ pathLength: 0.3, opacity: 0.6 }}
          animate={{
            pathLength: 1,
            opacity: [0.3, 0.6, 0.3],
            pathOffset: [0, 1, 0],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </svg>
  </div>
);

/* ===============================
   Step 1: Email Entry
================================ */
const Step1EmailEntry = ({ email, onEmailChange, onSubmit, loading, error }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold text-white">Forgot Your Password?</h3>
      <p className="text-gray-400 text-sm mt-2">
        Enter your email address and we'll send you a verification code
      </p>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-white mb-1.5">Email Address</label>
        <div className="relative flex items-center">
          <Mail size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
          />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400 flex items-start gap-2"
        >
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-md font-semibold bg-white hover:bg-gray-100 text-black text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending Code...
          </>
        ) : (
          <>
            Send Verification Code
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  </motion.div>
);

/* ===============================
   Step 2: Code Verification
================================ */
const Step2VerifyCode = ({ code, onCodeChange, onSubmit, onBack, loading, error, successMessage }) => {
  const handleCodeChange = (value) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    onCodeChange(sanitized);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white">Verify Your Code</h3>
        <p className="text-gray-400 text-sm mt-2">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md bg-green-950/50 border border-green-800 px-3 py-2 text-sm text-green-400 flex items-center gap-2 mb-4"
        >
          <CheckCircle2 size={16} />
          {successMessage}
        </motion.div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white mb-1.5">Verification Code</label>
          <input
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            maxLength={6}
            required
            className="w-full text-center text-2xl font-bold letter-spacing-widest bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md py-3 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all font-mono tracking-widest"
          />
          <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code from your email</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400 flex items-start gap-2"
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-2.5 rounded-md font-semibold bg-white hover:bg-gray-100 text-black text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Code
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 rounded-md font-medium text-gray-300 border border-gray-700 hover:bg-gray-800 text-sm transition-all"
        >
          Back
        </button>
      </form>
    </motion.div>
  );
};

/* ===============================
   Step 3: Password Reset
================================ */
const Step3ResetPassword = ({ password, confirmPassword, showPassword, showConfirmPassword, onPasswordChange, onConfirmPasswordChange, onShowPasswordToggle, onShowConfirmPasswordToggle, onSubmit, onBack, loading, error, successMessage }) => {
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isValid = password.length >= 8 && passwordsMatch;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white">Set New Password</h3>
        <p className="text-gray-400 text-sm mt-2">
          Create a strong password for your account
        </p>
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md bg-green-950/50 border border-green-800 px-3 py-2 text-sm text-green-400 flex items-center gap-2 mb-4"
        >
          <CheckCircle2 size={16} />
          {successMessage}
        </motion.div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white mb-1.5">New Password</label>
          <div className="relative flex items-center">
            <Lock size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a new password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pl-9 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => onShowPasswordToggle()}
              className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label className="block text-sm text-white mb-1.5">Confirm Password</label>
          <div className="relative flex items-center">
            <Lock size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pl-9 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => onShowConfirmPasswordToggle()}
              className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {password && confirmPassword && !passwordsMatch && (
          <div className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>Passwords do not match</span>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400 flex items-start gap-2"
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full py-2.5 rounded-md font-semibold bg-white hover:bg-gray-100 text-black text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Resetting Password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 rounded-md font-medium text-gray-300 border border-gray-700 hover:bg-gray-800 text-sm transition-all"
        >
          Back
        </button>
      </form>
    </motion.div>
  );
};

/* ===============================
   Main Component
================================ */
const ForgotPasswordFaculty = ({ onBack }) => {
  const { requestVerificationCode, verifyCode, resetPassword, loading, error } = usePasswordRecovery();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    try {
      await requestVerificationCode(email, "FACULTY");
      setSuccessMessage("Verification code sent! Check your email.");
      setTimeout(() => {
        setStep(2);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      // Error is shown in the component
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    try {
      await verifyCode(code);
      setSuccessMessage("Code verified! Now set your new password.");
      setTimeout(() => {
        setStep(3);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      // Error is shown in the component
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(code, password);
      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        onBack?.();
      }, 2000);
    } catch (err) {
      // Error is shown in the component
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <BgPaths />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-sm bg-black/80 border border-gray-800 rounded-lg shadow-2xl p-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s <= step
                      ? "bg-[#00C2FF] text-black"
                      : "bg-gray-800 text-gray-500"
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-8 h-0.5 transition-all ${
                      s < step ? "bg-[#00C2FF]" : "bg-gray-800"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Content */}
            <div className="min-h-[300px]">
              {step === 1 && (
                <Step1EmailEntry
                  email={email}
                  onEmailChange={setEmail}
                  onSubmit={handleStep1Submit}
                  loading={loading}
                  error={error}
                />
              )}
              {step === 2 && (
                <Step2VerifyCode
                  code={code}
                  onCodeChange={setCode}
                  onSubmit={handleStep2Submit}
                  onBack={() => setStep(1)}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                />
              )}
              {step === 3 && (
                <Step3ResetPassword
                  password={password}
                  confirmPassword={confirmPassword}
                  showPassword={showPassword}
                  showConfirmPassword={showConfirmPassword}
                  onPasswordChange={setPassword}
                  onConfirmPasswordChange={setConfirmPassword}
                  onShowPasswordToggle={() => setShowPassword(!showPassword)}
                  onShowConfirmPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  onSubmit={handleStep3Submit}
                  onBack={() => setStep(2)}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                />
              )}
            </div>

            {/* Back to Login Link */}
            <div className="mt-6 pt-4 border-t border-gray-800 text-center">
              <button
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-[#00C2FF] transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Assignment Submission Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordFaculty;
