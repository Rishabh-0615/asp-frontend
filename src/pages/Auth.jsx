import { useState } from "react";
import { User, Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

/* ===============================
   Animated Background
   (exact same as ClientAuth)
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
   Reusable Input
================================ */
const AuthInput = ({ icon: Icon, type = "text", placeholder, value, onChange, autoComplete }) => {
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
                autoComplete={autoComplete}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md py-2.5 pr-4 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/40 focus:border-[#00C2FF] transition-all"
                style={{ paddingLeft: Icon ? "2.25rem" : "0.75rem" }}
            />
            {isPassword && (
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
                >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            )}
        </div>
    );
};

/* ===============================
   Auth Page (Login + Register)
================================ */
const Auth = ({ onLoginSuccess, onForgotPassword }) => {
    const { login, register, loading, error } = useAuth();

    const [tab, setTab] = useState("login"); // "login" | "register"

    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
    const [formError, setFormError] = useState(null);

    const handleLoginChange = (field) => (e) =>
        setLoginForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleRegisterChange = (field) => (e) =>
        setRegisterForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleLogin = async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
            await login(loginForm.email, loginForm.password);
            onLoginSuccess?.();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
            await register(registerForm.name, registerForm.email, registerForm.password);
        } catch (err) {
            setFormError(err.message);
        }
    };

    const switchTab = (t) => {
        setTab(t);
        setFormError(null);
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
                            {["Faculty", "Portal"].map((word, wordIndex) => (
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
                            Manage and submit your assignments with ease
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
                            <h2 className="text-2xl font-bold text-white">
                                {tab === "login" ? "Welcome Back" : "Create Account"}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {tab === "login" ? "Sign in to your faculty account" : "Join the Assignment Submission Portal"}
                            </p>
                        </div>

                        {/* Tab switcher */}
                        <div className="px-6 pt-2">
                            <div className="grid grid-cols-2 bg-gray-800/50 rounded-md p-1 mb-4">
                                <button
                                    onClick={() => switchTab("login")}
                                    className={`text-sm font-medium py-1.5 rounded transition-colors ${tab === "login"
                                            ? "bg-white text-black"
                                            : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => switchTab("register")}
                                    className={`text-sm font-medium py-1.5 rounded transition-colors ${tab === "register"
                                            ? "bg-white text-black"
                                            : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>

                        {/* Forms */}
                        <div className="px-6 pb-6">

                            {/* LOGIN FORM */}
                            {tab === "login" && (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-white mb-1.5">Email</label>
                                        <AuthInput
                                            icon={Mail}
                                            type="email"
                                            placeholder="Enter your email"
                                            value={loginForm.email}
                                            onChange={handleLoginChange("email")}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white mb-1.5">Password</label>
                                        <AuthInput
                                            icon={Lock}
                                            type="password"
                                            placeholder="Enter your password"
                                            value={loginForm.password}
                                            onChange={handleLoginChange("password")}
                                            autoComplete="current-password"
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
                                        className="w-full py-2.5 rounded-md font-semibold bg-white hover:bg-gray-100 text-black text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Signing in..." : "Sign In"}
                                    </button>
                                </form>
                            )}

                            {/* FORGOT PASSWORD & STUDENT LOGIN LINKS (for login tab only) */}
                            {tab === "login" && (
                                <div className="mt-5 pt-4 border-t border-gray-800 space-y-2">
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={onForgotPassword}
                                            className="text-sm text-gray-500 hover:text-[#00C2FF] transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <a
                                            href="/student/login"
                                            className="text-sm text-gray-500 hover:text-[#00C2FF] transition-colors"
                                        >
                                            Student login →
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* REGISTER FORM */}
                            {tab === "register" && (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-white mb-1.5">Full Name</label>
                                        <AuthInput
                                            icon={User}
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={registerForm.name}
                                            onChange={handleRegisterChange("name")}
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white mb-1.5">Email</label>
                                        <AuthInput
                                            icon={Mail}
                                            type="email"
                                            placeholder="Enter your email"
                                            value={registerForm.email}
                                            onChange={handleRegisterChange("email")}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white mb-1.5">Password</label>
                                        <AuthInput
                                            icon={Lock}
                                            type="password"
                                            placeholder="Create a password"
                                            value={registerForm.password}
                                            onChange={handleRegisterChange("password")}
                                            autoComplete="new-password"
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
                                        className="w-full py-2.5 rounded-md font-semibold bg-white hover:bg-gray-100 text-black text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Creating account..." : "Create Account"}
                                    </button>
                                </form>
                            )}

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

export default Auth;