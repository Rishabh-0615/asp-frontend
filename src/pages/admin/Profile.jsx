import { useAuth } from "../../context/AuthContext";
import { User, Mail, Shield, Building, IdCard, BadgeCheck } from "lucide-react";

const Profile = () => {
  const { faculty } = useAuth();

  if (!faculty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C2FF]"></div>
      </div>
    );
  }

  const profileItems = [
    {
      label: "Full Name",
      value: faculty.name || "N/A",
      icon: User,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Email Address",
      value: faculty.email || "N/A",
      icon: Mail,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Department",
      value: faculty.department || "Information Technology",
      icon: Building,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Account Role",
      value: faculty.isAdmin ? "Administrator" : "Faculty Member",
      icon: Shield,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "Employee ID",
      value: faculty.id?.slice(0, 8).toUpperCase() || "N/A",
      icon: IdCard,
      color: "text-pink-400",
      bgColor: "bg-pink-400/10",
    },
    {
      label: "Account Status",
      value: faculty.status || "ACTIVE",
      icon: BadgeCheck,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F3F4F6]">My Profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-[#1C1F23] border border-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
          <div className="w-24 h-24 rounded-full bg-[#00C2FF]/10 border-2 border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] text-4xl font-bold shadow-[0_0_20px_rgba(0,194,255,0.2)]">
            {faculty.name?.[0] || "A"}
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-[#F3F4F6] mb-1">
              {faculty.name}
            </h3>
            <p className="text-gray-400 mb-4">{faculty.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-[#00C2FF] text-xs font-medium uppercase tracking-wider">
                {faculty.isAdmin ? "Admin Access" : "Faculty Member"}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-medium uppercase tracking-wider">
                {faculty.status || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        {profileItems.map((item, idx) => (
          <div
            key={idx}
            className="group bg-[#1C1F23] border border-gray-800 hover:border-[#00C2FF]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                  {item.label}
                </p>
                <p className="text-lg font-medium text-[#F3F4F6]">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
