import { GraduationCap } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="h-14 px-6 flex items-center justify-between
      bg-[#1C1F23]
      border-b border-gray-800
      sticky top-0 z-50">

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#00C2FF]/10 border border-[#00C2FF]/30 flex items-center justify-center">
          <GraduationCap size={16} className="text-[#00C2FF]" />
        </div>
        <span className="font-bold text-[#F3F4F6] tracking-tight text-sm">
          Assignment<span className="text-[#00C2FF]">Portal</span>
        </span>
      </div>
    </header>
  );
};

export default Navbar;
