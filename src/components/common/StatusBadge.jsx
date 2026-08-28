import React from "react";

export default function StatusBadge({ status, className = "" }) {
  const norm = (status || "").toLowerCase();

  let badgeStyles = "bg-slate-100 text-slate-700 border-slate-200";
  let label = status || "Upcoming";

  if (norm === "upcoming" || norm === "active") {
    badgeStyles = "bg-blue-50 text-blue-700 border-blue-200";
    label = "Upcoming";
  } else if (norm === "completed") {
    badgeStyles = "bg-slate-100 text-slate-600 border-slate-200";
    label = "Completed";
  } else if (norm === "full") {
    badgeStyles = "bg-amber-50 text-amber-800 border-amber-200";
    label = "Seats Full";
  } else if (norm === "closed") {
    badgeStyles = "bg-rose-50 text-rose-700 border-rose-200";
    label = "Registration Closed";
  } else if (norm === "confirmed" || norm === "registered") {
    badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    label = "Confirmed ✓";
  } else if (norm === "pending") {
    badgeStyles = "bg-amber-50 text-amber-700 border-amber-200";
    label = "Pending Approval";
  } else if (norm === "cancelled" || norm === "rejected") {
    badgeStyles = "bg-rose-50 text-rose-700 border-rose-200";
    label = "Cancelled";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyles} ${className}`}
    >
      {label}
    </span>
  );
}
