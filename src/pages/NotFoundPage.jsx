import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto my-16 px-4 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
        <GraduationCap className="w-6 h-6" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-base font-bold text-slate-700">Page Not Found</h2>
      <p className="text-xs text-slate-500">
        The requested campus event page or dashboard view could not be located.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to CampusConnect Home</span>
        </Link>
      </div>
    </div>
  );
}
