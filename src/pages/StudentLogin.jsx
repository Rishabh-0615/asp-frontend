import { useState } from "react";
import { useStudentAuth } from "../context/StudentAuthContext";
import { GraduationCap, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

/* ===============================
   Animated Background
   (exact same as ClientAuth / Auth)
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
   Student Login Page
================================ */
const StudentLogin = ({ onLoginSuccess }) => {
  const { login, activateAccount } = useStudentAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [activationForm, setActivationForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showActivationPassword, setShowActivationPassword] = useState(false);
  const [showActivationConfirmPassword, setShowActivationConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activationLoading, setActivationLoading] = useState(false);
  const [error, setError] = useState("");
  const [activationError, setActivationError] = useState("");
  const [activationState, setActivationState] = useState({
    open: false,
    email: "",
    tempPassword: "",
    name: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await login(form.email, form.password);
      if (response?.data?.activationRequired) {
        setActivationState({
          open: true,
          email: response.data.email || form.email,
          tempPassword: form.password,
          name: response.data.name || "",
        });
        return;
      }
      onLoginSuccess?.();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleActivationSubmit = async (e) => {
    e.preventDefault();
    setActivationError("");

    if (activationForm.newPassword !== activationForm.confirmPassword) {
      setActivationError("Passwords do not match.");
      return;
    }

    setActivationLoading(true);
    try {
      await activateAccount(
        activationState.email,
        activationState.tempPassword,
        activationForm.newPassword
      );
      setActivationState({ open: false, email: "", tempPassword: "", name: "" });
      setActivationForm({ newPassword: "", confirmPassword: "" });
      onLoginSuccess?.();
    } catch (err) {
      setActivationError(err.message || "Activation failed");
    } finally {
      setActivationLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">

      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <BgPaths />
      </div>

      {/* LEFT HERO TEXT */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter text-white">
              {["Student", "Portal"].map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                  {word.split("").map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: wordIndex * 0.1 + charIndex * 0.05,
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>
            <h2 className="text-xl sm:text-2xl text-[#00C2FF] font-semibold mb-2">
              Assignment Submission Portal
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl"
            >
              Access your assignments and submissions.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div className="relative z-10 min-h-screen flex">
        <div className="flex-shrink-0 w-full max-w-md lg:max-w-lg xl:max-w-xl flex items-center justify-center p-4 lg:p-8 ml-auto mr-4 lg:mr-8 xl:mr-12">
          <div className="w-full max-w-md backdrop-blur-sm bg-black/80 border border-gray-800 rounded-lg shadow-2xl">

            {/* Header */}
            <div className="text-center px-6 pt-8 pb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00C2FF]/10 border border-[#00C2FF]/30 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={22} className="text-[#00C2FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to your student account</p>
            </div>

            {/* Tab indicator — single tab, no switcher needed */}
            <div className="px-6 pt-2">
              <div className="bg-gray-800/50 rounded-md p-1 mb-4">
                <div className="bg-white text-black text-sm font-medium text-center py-1.5 rounded">
                  Student Login
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-sm text-white mb-1.5">Email</label>
                  <div className="relative flex items-center">
                    <Mail size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      required
                      autoComplete="email"
                      className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white mb-1.5">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      required
                      autoComplete="current-password"
                      className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pl-9 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md font-semibold bg-white hover:bg-gray-100 text-black text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              {/* Link back to faculty login */}
              <div className="mt-5 pt-4 border-t border-gray-800 text-center">
                <a
                  href="/"
                  className="text-sm text-gray-500 hover:text-[#00C2FF] transition-colors"
                >
                  Faculty login →
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {activationState.open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#111315] shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-800">
              <h3 className="text-xl font-semibold text-white">Activate Your Account</h3>
              <p className="text-sm text-gray-400 mt-1">
                {activationState.name ? `${activationState.name}, ` : ""}change your temporary password to continue.
              </p>
            </div>

            <form onSubmit={handleActivationSubmit} className="px-6 py-6 space-y-4">
              <div className="rounded-lg border border-[#00C2FF]/20 bg-[#00C2FF]/5 px-4 py-3 text-sm text-gray-300">
                Your account is in <span className="text-[#00C2FF] font-medium">PENDING_ACTIVATION</span> status. Set a new password and you will be logged in immediately.
              </div>

              <div>
                <label className="block text-sm text-white mb-1.5">New Password</label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
                  <input
                    type={showActivationPassword ? "text" : "password"}
                    placeholder="Create a new password"
                    value={activationForm.newPassword}
                    onChange={(e) => setActivationForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pl-9 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowActivationPassword((value) => !value)}
                    className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showActivationPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white mb-1.5">Confirm New Password</label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
                  <input
                    type={showActivationConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={activationForm.confirmPassword}
                    onChange={(e) => setActivationForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pl-9 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowActivationConfirmPassword((value) => !value)}
                    className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showActivationConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Use at least 8 characters with uppercase, lowercase, digit, and one of @#$!%*?&.</p>
              </div>

              {activationError && (
                <div className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400">
                  {activationError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActivationState({ open: false, email: "", tempPassword: "", name: "" });
                    setActivationForm({ newPassword: "", confirmPassword: "" });
                    setActivationError("");
                  }}
                  className="px-4 py-2.5 rounded-md text-sm text-gray-300 border border-gray-700 hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activationLoading}
                  className="px-5 py-2.5 rounded-md font-semibold bg-white hover:bg-gray-100 text-black text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {activationLoading ? "Activating..." : "Change Password & Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default StudentLogin;