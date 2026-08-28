import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../services/eventService";
import { X, CheckCircle2, AlertCircle, Loader2, Sparkles, Ticket } from "lucide-react";

export default function RegistrationModal({ event, isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isTeamEvent =
    event?.teamSize &&
    !event.teamSize.toLowerCase().includes("individual") &&
    event.teamSize.toLowerCase() !== "1 member";

  const [formData, setFormData] = useState({
    name: "",
    registerNumber: "",
    email: "",
    phone: "",
    department: "",
    year: "3rd Year",
    teamName: "",
    teamMembers: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Pre-fill student info from demo auth
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || "Alex Johnson",
        registerNumber: currentUser.registerNumber || "2023CSE042",
        email: currentUser.email || "alex.j@college.edu",
        phone: currentUser.phone || "9876543210",
        department: currentUser.department || "Computer Science & Engineering",
        year: currentUser.year || "3rd Year"
      }));
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !event) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.name.trim() || !formData.registerNumber.trim() || !formData.email.trim()) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    if (isTeamEvent && !formData.teamName.trim()) {
      setError("Please enter a Team Name for this team event.");
      return;
    }

    setLoading(true);
    try {
      const res = await eventService.registerForEvent(
        event.id,
        formData,
        currentUser?.id || "usr-std-1"
      );
      setSuccessData(res.registration);
      if (onSuccess) onSuccess(res.event);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToMyEvents = () => {
    onClose();
    navigate("/my-events");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {event.category} Event
            </span>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {successData ? "Registration Status" : `Register: ${event.name}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {successData ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="text-center py-2 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Registration Successful!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  You have been officially registered for this event. No payment needed.
                </p>
              </div>

              {/* Summary Card with Registration ID */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Registration ID:</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-sm">
                    {successData.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Event Name:</span>
                  <span className="font-semibold text-slate-800 text-right">{event.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="text-slate-700 text-right">{event.date} • {event.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Venue:</span>
                  <span className="text-slate-700 text-right">{event.venue}</span>
                </div>
                {successData.teamName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Team:</span>
                    <span className="text-slate-700 text-right">{successData.teamName}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoToMyEvents}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  View My Events
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
                <span className="font-semibold">Free Registration:</span> There is no entry fee or ticket charge for this college event.
              </div>

              {/* Basic Student Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Student Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="e.g. Alex Johnson"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Register Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registerNumber"
                    value={formData.registerNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    placeholder="e.g. 2023CSE042"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    College Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="alex@college.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              {/* Team fields if applicable */}
              {isTeamEvent && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Team Details ({event.teamSize})
                    </span>
                    <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Team Event
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Team Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleChange}
                      required={isTeamEvent}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      placeholder="e.g. Binary Beasts"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Team Members & Register Numbers
                    </label>
                    <textarea
                      name="teamMembers"
                      rows={2}
                      value={formData.teamMembers}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      placeholder="e.g. 1. Alex Johnson (2023CSE042), 2. Priya Sharma (2023CSE051)"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <span>Confirm Registration</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
