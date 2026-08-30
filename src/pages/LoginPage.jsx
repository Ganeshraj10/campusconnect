import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  User,
  KeyRound,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  Sparkles
} from "lucide-react";

export default function LoginPage() {
  const { switchRole, login, register, logout, role, currentUser, demoAccounts } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("demo"); // 'demo' | 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [switchingRole, setSwitchingRole] = useState(null);

  // Sign In Form State
  const [loginForm, setLoginForm] = useState({
    email: "alex.j@college.edu",
    password: "password123"
  });

  // Registration Form State
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    department: "Computer Science & Engineering",
    registerNumber: "",
    year: "3rd Year",
    phone: ""
  });

  const redirectToDashboard = (userRole) => {
    const norm = (userRole || "").toUpperCase();
    if (norm === "STUDENT") navigate("/dashboard");
    else if (norm === "ORGANIZER") navigate("/organizer/dashboard");
    else if (norm === "ADMIN") navigate("/admin/dashboard");
    else navigate("/events");
  };

  // 1. One-Click Demo Role Login
  const handleSelectRole = async (roleName) => {
    setError("");
    setSuccessMsg("");
    setSwitchingRole(roleName);
    try {
      const user = await switchRole(roleName);
      setSuccessMsg(`Successfully logged in as ${user.name}!`);
      setTimeout(() => {
        redirectToDashboard(user.role);
      }, 500);
    } catch (err) {
      setError(err.message || "Failed to log in to demo account.");
    } finally {
      setSwitchingRole(null);
    }
  };

  // 2. Custom Email & Password Login
  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!loginForm.email.trim() || !loginForm.password) {
      setError("Please enter both email address and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(loginForm.email.trim(), loginForm.password);
      setSuccessMsg(`Welcome back, ${result.user.name}!`);
      setTimeout(() => {
        redirectToDashboard(result.user.role);
      }, 500);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Custom Account Registration
  const handleCustomRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password) {
      setError("Please fill in all required fields (Name, Email, Password).");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await register(registerForm);
      setSuccessMsg(`Account created! Welcome, ${result.user.name}.`);
      setTimeout(() => {
        redirectToDashboard(result.user.role);
      }, 500);
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setSuccessMsg("You have been signed out.");
    setTimeout(() => setSuccessMsg(""), 3000);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          CampusConnect Authentication
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Sign in to your account, create a new college profile, or use one-click demo credentials.
        </p>
      </div>

      {/* Active User Session Notice */}
      {currentUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {currentUser.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                Currently Logged In
              </div>
              <div className="text-sm font-bold text-slate-900">
                {currentUser.name}{" "}
                <span className="text-xs font-normal text-slate-500">
                  ({role || currentUser.role})
                </span>
              </div>
              <div className="text-xs text-slate-500">{currentUser.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => redirectToDashboard(currentUser.role)}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab("demo");
            setError("");
          }}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === "demo"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Demo Role Accounts</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            setError("");
          }}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === "login"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Custom Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("register");
            setError("");
          }}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === "register"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Account</span>
        </button>
      </div>

      {/* TAB 1: 1-Click Demo Accounts */}
      {activeTab === "demo" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rolesList.map((item) => {
              const Icon = item.icon;
              const isCurrent = role === item.roleName && currentUser;
              const isSwitching = switchingRole === item.roleName;

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
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
                      <div className="font-semibold text-slate-800">{item.user.name}</div>
                      <div className="text-slate-500 truncate">{item.user.email}</div>
                      <div className="text-[11px] text-slate-400">{item.user.department}</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={isSwitching || loading}
                      onClick={() => handleSelectRole(item.roleName)}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${item.buttonColor} disabled:opacity-60`}
                    >
                      {isSwitching ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>{isCurrent ? "Go to Dashboard" : `Log in as ${item.roleName}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginForm({
                          email: item.user.email,
                          password: item.user.password || "password123"
                        });
                        setActiveTab("login");
                      }}
                      className="w-full py-1.5 text-[11px] text-slate-500 hover:text-blue-600 font-medium transition"
                    >
                      Prefill in Sign In Form →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Custom Sign In */}
      {activeTab === "login" && (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs animate-in fade-in space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Sign in to your Account</h2>
            <p className="text-xs text-slate-500">
              Enter your college email and password to continue.
            </p>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="name@college.edu"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an account yet?{" "}
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className="font-semibold text-blue-600 hover:text-blue-700 underline"
            >
              Register here
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Register New Account */}
      {activeTab === "register" && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs animate-in fade-in space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Create a New Account</h2>
            <p className="text-xs text-slate-500">
              Register as a student or event organizer.
            </p>
          </div>

          <form onSubmit={handleCustomRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="rahul.s@college.edu"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="STUDENT">Student</option>
                  <option value="ORGANIZER">Event Organizer / Faculty</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={registerForm.department}
                  onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                  placeholder="Computer Science & Engineering"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Register / Roll Number
                </label>
                <input
                  type="text"
                  value={registerForm.registerNumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, registerNumber: e.target.value })}
                  placeholder="e.g. 2024CSE105"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year of Study
                </label>
                <select
                  value={registerForm.year}
                  onChange={(e) => setRegisterForm({ ...registerForm, year: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Faculty">Faculty / Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className="font-semibold text-blue-600 hover:text-blue-700 underline"
            >
              Sign in
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
