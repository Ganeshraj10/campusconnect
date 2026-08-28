import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Heart, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                Campus<span className="text-blue-600">Connect</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm">
              A centralized college event discovery and free registration platform built for campus workshops, hackathons, seminars, and technical competitions.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Free Registration • No Fees or Payments Required</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-blue-600 transition">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/my-events" className="hover:text-blue-600 transition">
                  My Registrations
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 transition">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Context */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Academic Project
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Agile Development Course Project
              <br />
              Department of Computer Science & Engineering
              <br />
              Academic Year 2026
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Switch Demo Roles →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} CampusConnect. Realistic Student Development Project.
          </div>
          <div>
            Built with React, Vite & Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
}
