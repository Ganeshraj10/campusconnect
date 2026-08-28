import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, UserCheck, ShieldCheck, ArrowRight, User } from "lucide-react";

export default function LoginPage() {
  const { switchRole, role, currentUser, demoAccounts } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (roleName) => {
    switchRole(roleName);
    if (roleName === "Student") navigate("/dashboard");
    else if (roleName === "Organizer") navigate("/organizer/dashboard");
    else if (roleName === "Admin") navigate("/admin/dashboard");
  };

  const rolesList = [
    {
      roleName: "Student",
      title: "Student Account",
      user: demoAccounts.Student,
      desc: "Discover upcoming hackathons, register with college ID, and view event passes in My Events.",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    {
      roleName: "Organizer",
      title: "Faculty / Club Organizer",
      user: demoAccounts.Organizer,
      desc: "Create and publish campus events, monitor real-time student registrations, and manage capacities.",
      icon: UserCheck,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-500",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700 text-white"
    },
    {
      roleName: "Admin",
      title: "Dean / System Administrator",
      user: demoAccounts.Admin,
      desc: "Administrative oversight, approving pending student events, and monitoring campus-wide metrics.",
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-500",
      buttonColor: "bg-purple-600 hover:bg-purple-700 text-white"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Demo Role Authentication
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Select any of the three pre-configured college demo accounts to explore role-based permissions and workflows.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rolesList.map((item) => {
          const Icon = item.icon;
          const isCurrent = role === item.roleName;

          return (
            <div
              key={item.roleName}
              className={`bg-white border rounded-2xl p-6 flex flex-col justify-between space-y-5 transition shadow-xs ${
                isCurrent ? "ring-2 ring-blue-600 border-blue-300" : "border-slate-200 hover:shadow-md"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                      Active Role
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.desc}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
                  <div className="font-semibold text-slate-800">{item.user.name}</div>
                  <div className="text-slate-500 truncate">{item.user.email}</div>
                  <div className="text-[11px] text-slate-400">{item.user.department}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectRole(item.roleName)}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${item.buttonColor}`}
              >
                <span>{isCurrent ? "Go to Dashboard" : `Log in as ${item.roleName}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-600">
        <span className="font-semibold">Agile Project Note:</span> Real authentication with JWT and secure password hashing will be integrated with the Node.js/Express and PostgreSQL backend.
      </div>
    </div>
  );
}
