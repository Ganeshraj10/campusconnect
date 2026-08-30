import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  GraduationCap, 
  Calendar, 
  BookmarkCheck, 
  LayoutDashboard, 
  PlusCircle, 
  ShieldCheck, 
  User, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  LogIn
} from "lucide-react";

export default function Navbar() {
  const { currentUser, role, switchRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = async (newRole) => {
    try {
      await switchRole(newRole);
      setRoleDropdownOpen(false);
      if (newRole === "Student") navigate("/dashboard");
      else if (newRole === "Organizer") navigate("/organizer/dashboard");
      else if (newRole === "Admin") navigate("/admin/dashboard");
    } catch (err) {
      console.error("Failed to switch role:", err);
    }
  };

  const handleLogout = () => {
    logout();
    setRoleDropdownOpen(false);
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700 font-semibold"
        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 leading-tight tracking-tight">
                  Campus<span className="text-blue-600">Connect</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium -mt-0.5">
                  College Events Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/" className={navLinkClass} end>
                Home
              </NavLink>
              <NavLink to="/events" className={navLinkClass}>
                Events
              </NavLink>
              <NavLink to="/my-events" className={navLinkClass}>
                My Events
              </NavLink>

              {/* Role specific quick links */}
              {role === "Student" && (
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
              )}

              {role === "Organizer" && (
                <>
                  <NavLink to="/organizer/dashboard" className={navLinkClass}>
                    Organizer Dashboard
                  </NavLink>
                  <NavLink
                    to="/organizer/events/create"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Event</span>
                  </NavLink>
                </>
              )}

              {role === "Admin" && (
                <NavLink to="/admin/dashboard" className={navLinkClass}>
                  Admin Dashboard
                </NavLink>
              )}
            </div>
          </div>

          {/* Right Side: Demo Role Switcher & Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <>
                {/* Quick Role Switcher Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                    title="Switch demo account role"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Role: <strong className="text-blue-700">{role || currentUser.role}</strong></span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      </div>

                      <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Demo Role
                      </div>

                      <button
                        onClick={() => handleRoleChange("Student")}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          role === "Student" ? "font-semibold text-blue-600 bg-blue-50/50" : "text-slate-700"
                        }`}
                      >
                        <span>🎓 Student (Alex J.)</span>
                        {role === "Student" && <span className="text-blue-600">✓</span>}
                      </button>

                      <button
                        onClick={() => handleRoleChange("Organizer")}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          role === "Organizer" ? "font-semibold text-blue-600 bg-blue-50/50" : "text-slate-700"
                        }`}
                      >
                        <span>📋 Organizer (Prof. Rajesh)</span>
                        {role === "Organizer" && <span className="text-blue-600">✓</span>}
                      </button>

                      <button
                        onClick={() => handleRoleChange("Admin")}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          role === "Admin" ? "font-semibold text-blue-600 bg-blue-50/50" : "text-slate-700"
                        }`}
                      >
                        <span>🛡️ Admin (Dr. Anita)</span>
                        {role === "Admin" && <span className="text-blue-600">✓</span>}
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <Link
                        to="/login"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Manage Accounts / Login</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile / Account link */}
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser?.name || "Account"}</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`
            }
          >
            Events
          </NavLink>
          <NavLink
            to="/my-events"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`
            }
          >
            My Events
          </NavLink>

          {role === "Student" && (
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              Student Dashboard
            </NavLink>
          )}

          {role === "Organizer" && (
            <>
              <NavLink
                to="/organizer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                Organizer Dashboard
              </NavLink>
              <NavLink
                to="/organizer/events/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 bg-blue-50"
              >
                + Create Event
              </NavLink>
            </>
          )}

          {role === "Admin" && (
            <NavLink
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              Admin Dashboard
            </NavLink>
          )}

          {/* Mobile Role Switcher */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase">Switch Demo Role</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  handleRoleChange("Student");
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1.5 text-xs rounded border text-center ${
                  role === "Student" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200"
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  handleRoleChange("Organizer");
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1.5 text-xs rounded border text-center ${
                  role === "Organizer" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200"
                }`}
              >
                Organizer
              </button>
              <button
                onClick={() => {
                  handleRoleChange("Admin");
                  setMobileMenuOpen(false);
                }}
                className={`px-2 py-1.5 text-xs rounded border text-center ${
                  role === "Admin" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200"
                }`}
              >
                Admin
              </button>
            </div>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser.name})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
