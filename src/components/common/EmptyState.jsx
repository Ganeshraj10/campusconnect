import React from "react";
import { CalendarX, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({
  icon: Icon = CalendarX,
  title = "No events found",
  description = "There are no events matching your criteria at this moment.",
  actionText,
  actionLink,
  onActionClick
}) {
  return (
    <div className="bg-white border border-slate-200 border-dashed rounded-xl p-10 text-center my-6 max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          {actionText || "Explore Events"}
        </Link>
      )}

      {onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {actionText || "Reset Filters"}
        </button>
      )}
    </div>
  );
}
