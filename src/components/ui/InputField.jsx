import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({ label, type = "text", placeholder, icon: Icon, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-widest uppercase text-gray-500">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon size={16} />
          </span>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full rounded-lg border py-3 pr-4 text-sm transition-all duration-200 outline-none
            ${Icon ? "pl-11" : "pl-4"}
            bg-[#0E0F11]
            border-gray-700
            text-[#F3F4F6]
            placeholder-gray-600
            focus:border-[#00C2FF]
            focus:ring-2 focus:ring-[#00C2FF]/20
            ${error ? "border-[#F87171] focus:border-[#F87171] focus:ring-[#F87171]/20" : ""}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2
              text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-[#F87171]">{error}</p>
      )}
    </div>
  );
};

export default InputField;
