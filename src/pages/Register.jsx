import { useState } from "react";
import { User, Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

/* ===============================
   Animated Background Component
   (exact same as ClientAuth)
================================ */
const BgPaths = () => {
  return (
    <div className="absolute inset-0">
      <svg
        className="w-full h-full text-white"
        viewBox="0 0 696 316"
        fill="none"
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
};

/* ===============================
   Input Component
================================ */
const AuthInput = ({ icon: Icon, type = "text", placeholder, value, onChange }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="relative flex items-center">
      {Icon && (
        <Icon size={15} className="absolute left-3 text-gray-500 pointer-events-none" />
      )}
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pr-4 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
        style={{ paddingLeft: Icon ? "2.25rem" : "0.75rem" }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 text-gray-500 hover:text-gray-300"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
};

/* ===============================
   Register Page
================================ */
const Register = ({ onNavigateToLogin }) => {
  const { register, loading, error } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">

      {/* FULL SCREEN ANIMATED BACKGROUND */}
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
              {["Assignment", "Portal"].map((word, wordIndex) => (
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
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl"
            >
              Manage and submit your assignments with ease
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* AUTH PANEL — right side */}
      <div className="relative z-10 min-h-screen flex">
        <div className="flex-shrink-0 w-full max-w-md lg:max-w-lg xl:max-w-xl flex items-center justify-center p-4 lg:p-8 ml-auto mr-4 lg:mr-8 xl:mr-12">
          <div className="w-full max-w-md backdrop-blur-sm bg-black/80 border border-gray-800 rounded-lg shadow-2xl">

            <div className="text-center px-6 pt-8 pb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00C2FF]/10 border border-[#00C2FF]/30 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={22} className="text-[#00C2FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-gray-400 text-sm mt-1">Join the Assignment Portal</p>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-2">
              <div className="grid grid-cols-2 bg-gray-800/50 rounded-md p-1 mb-4">
                <button
                  onClick={onNavigateToLogin}
                  className="text-gray-400 text-sm font-medium py-1.5 rounded hover:text-white"
                >
                  Login
                </button>
                <div className="bg-white text-black text-sm font-medium text-center py-1.5 rounded">
                  Sign Up
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-white mb-1.5">Full Name</label>
                  <AuthInput
                    icon={User}
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange("name")}
                  />
                </div>
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
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange("password")}
                  />
                </div>

                {(formError || error) && (
                  <div className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-400">
                    {formError || error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md font-semibold bg-white hover:bg-gray-100 text-black text-sm"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Assignment Portal
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;