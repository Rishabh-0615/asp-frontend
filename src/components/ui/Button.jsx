const Button = ({ children, onClick, type = "button", loading = false, variant = "primary", className = "" }) => {
  const base = "w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#00C2FF] hover:bg-[#0099CC] active:scale-[0.98] text-[#0E0F11] shadow-lg shadow-[#00C2FF]/20",
    outline: "border border-gray-700 text-gray-300 hover:bg-white/5 hover:border-gray-600 hover:text-[#F3F4F6]",
    ghost:   "text-[#00C2FF] hover:bg-[#00C2FF]/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-[#0E0F11]/30 border-t-[#0E0F11] rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

export default Button;
