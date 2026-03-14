import { useState } from "react";
import { Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* Animated SVG background paths — same formula as clearie */
const BgPaths = () => {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5} -${189 + i * 6}C-${380 - i * 5} -${189 + i * 6} -${312 - i * 5} ${216 - i * 6} ${152 - i * 5} ${343 - i * 6}C${616 - i * 5} ${470 - i * 6} ${684 - i * 5} ${875 - i * 6} ${684 - i * 5} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    opacity: 0.06 + i * 0.012,
    duration: 20 + (i % 7) * 3,
    delay: i * 0.4,
  }));

  return (
    <svg
      className="w-full h-full text-[#00C2FF]"
      viewBox="0 0 696 316"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          stroke="currentColor"
          strokeWidth={p.width}
          strokeOpacity={p.opacity}
          strokeDasharray="2000"
          strokeDashoffset="2000"
          style={{
            animation: `path-draw ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </svg>
  );
};

/* Dark input field for the auth panel */
const AuthInput = ({ icon: Icon, type = "text", placeholder, value, onChange }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="relative flex items-center">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3 text-gray-500 pointer-events-none"
        />
      )}
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pr-4 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
        style={{ paddingLeft: Icon ? "2.25rem" : "0.75rem" }}
        autoComplete={isPassword ? "current-password" : "email"}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
};

const Login = ({ onNavigateToRegister, onLoginSuccess }) => {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await login(form.email, form.password);
      onLoginSuccess?.();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>

      {/* ── Animated SVG paths background ── */}
      <div className="absolute inset-0 z-0">
        <BgPaths />
      </div>

      {/* ── Large watermark title (bottom-left, decorative) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-end pb-28 px-8 select-none">
        <h1
          className="text-7xl sm:text-8xl xl:text-9xl font-bold tracking-tighter text-white leading-none"
          style={{ opacity: 0.06 }}
        >
          Assignment
          <br />
          Portal
        </h1>
      </div>

      {/* ── Auth panel — right-docked ── */}
      <div className="relative z-10 min-h-screen flex">
        <div className="flex-shrink-0 w-full max-w-sm sm:max-w-md flex items-center justify-center p-4 sm:p-8 ml-auto mr-2 sm:mr-6 xl:mr-12">
          <div className="w-full backdrop-blur-sm bg-black/80 border border-gray-800 rounded-lg shadow-2xl">

            {/* Panel header */}
            <div className="text-center px-6 pt-8 pb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00C2FF]/10 border border-[#00C2FF]/30 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={22} className="text-[#00C2FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to your faculty account</p>
            </div>

            {/* Tabs indicator */}
            <div className="px-6 pt-2">
              <div className="grid grid-cols-2 bg-gray-800/50 rounded-md p-1 mb-4">
                <div className="bg-white text-black text-sm font-medium text-center py-1.5 rounded">
                  Login
                </div>
                <button
                  onClick={onNavigateToRegister}
                  className="text-gray-400 text-sm font-medium text-center py-1.5 rounded hover:text-white transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-white mb-1.5">Email</label>
                  <AuthInput
                    icon={Mail}
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange("email")}
                  />
                </div>

                <div>
                  <label className="block text-sm text-white mb-1.5">Password</label>
                  <AuthInput
                    icon={Lock}
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange("password")}
                  />
                </div>

                {(formError || error) && (
                  <div className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2.5 text-sm text-red-400">
                    {formError || error}
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Assignment Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
