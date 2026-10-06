import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { CATEGORIES, SAMPLE_POSTERS } from "../data/events";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  X
} from "lucide-react";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Technical",
    organizer: currentUser?.department || "Computer Science Association",
    poster: SAMPLE_POSTERS[0],
    date: "",
    startTime: "09:30 AM",
    endTime: "04:30 PM",
    venue: "",
    teamSize: "1 - 3 Members",
    capacity: 100,
    registrationDeadline: "",
    rulesText:
      "All team members must carry valid college identity cards.\nReport to the venue 15 minutes prior to start time.\nDecisions of the faculty coordinators will be final."
  });

  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept only JPEG, PNG, WebP
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please select a JPEG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    // Maximum file size: 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("File size exceeds 5 MB limit. Please select a smaller image.");
      e.target.value = "";
      return;
    }

    setError("");
    setPosterFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPosterPreview(previewUrl);
  };

  const handleRemoveFile = () => {
    setPosterFile(null);
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
      setPosterPreview(null);
    }
    const fileInput = document.getElementById("poster-file-input");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.date || !formData.venue.trim()) {
      setError("Please fill in all mandatory fields (Name, Date, Venue).");
      return;
    }

    setLoading(true);
    try {
      // Split rules lines
      const rules = formData.rulesText
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      if (posterFile) {
        // When local file is selected: construct FormData
        const formPayload = new FormData();
        formPayload.append("name", formData.name.trim());
        formPayload.append("description", formData.description || "");
        formPayload.append("category", formData.category);
        formPayload.append("organizer", formData.organizer);
        formPayload.append("date", formData.date);
        formPayload.append("startTime", formData.startTime || "09:30 AM");
        formPayload.append("endTime", formData.endTime || "04:30 PM");
        formPayload.append("venue", formData.venue.trim());
        formPayload.append("teamSize", formData.teamSize);
        formPayload.append("capacity", formData.capacity);
        if (formData.registrationDeadline) {
          formPayload.append("registrationDeadline", formData.registrationDeadline);
        }
        formPayload.append("rules", JSON.stringify(rules));
        formPayload.append("poster", posterFile); // exact field name "poster"

        await eventService.createEvent(formPayload);
      } else {
        // When no local file is selected: preserve existing URL behavior
        await eventService.createEvent({
          ...formData,
          rules
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/organizer/dashboard");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <Link
        to="/organizer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Organizer Dashboard</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Form Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">
            Create New Campus Event
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the event details to publish it to the student discovery portal.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Event created successfully! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. AI Innovation Challenge 2026"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Category & Organizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Organizer / Host Club <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Robotics Student Society"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Detailed description of what will happen during the event, topics covered, and eligibility..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Poster Selector (Local Upload or URL / Presets) */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Event Poster
                </label>
                <span className="text-[11px] text-slate-500">
                  Upload local image or select preset / enter URL
                </span>
              </div>

              {/* Local File Upload Input */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Upload Image File (JPEG, PNG, WebP &bull; Max 5 MB)
                </label>
                <input
                  type="file"
                  id="poster-file-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg cursor-pointer bg-white p-1 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Selected File Details & Clear Action */}
              {posterFile && (
                <div className="flex items-center justify-between p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium text-blue-900 truncate">
                      Selected file: {posterFile.name} ({(posterFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold ml-2 shrink-0 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear file</span>
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase font-semibold text-slate-400">
                  {posterFile ? "Using uploaded image file above" : "Or use image URL / Presets"}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Poster URL and Presets */}
              <div className={`space-y-2 ${posterFile ? "opacity-50 pointer-events-none" : ""}`}>
                <input
                  type="url"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  disabled={Boolean(posterFile)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  <span className="text-[11px] text-slate-500 font-medium shrink-0">
                    Sample Presets:
                  </span>
                  {SAMPLE_POSTERS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={Boolean(posterFile)}
                      onClick={() => setFormData({ ...formData, poster: p })}
                      className={`w-12 h-8 rounded border overflow-hidden shrink-0 transition ${
                        formData.poster === p && !posterFile
                          ? "ring-2 ring-blue-600 scale-105"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={p} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Poster Preview */}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                  Poster Preview:
                </span>
                <div className="relative w-full h-36 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img
                    src={posterPreview || formData.poster}
                    alt="Poster Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
                    {posterFile ? "Local File Upload" : "Remote URL / Preset"}
                  </div>
                </div>
              </div>
            </div>

            {/* Date, Start Time, End Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Start Time
                </label>
                <input
                  type="text"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  placeholder="09:30 AM"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  End Time
                </label>
                <input
                  type="text"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  placeholder="04:30 PM"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Venue, Team Size, Max Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Venue / Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Main Auditorium & CS Lab 2"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Team Size
                </label>
                <select
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="Individual">Individual</option>
                  <option value="1 - 2 Members">1 - 2 Members</option>
                  <option value="1 - 3 Members">1 - 3 Members</option>
                  <option value="2 - 4 Members">2 - 4 Members</option>
                  <option value="3 - 5 Members">3 - 5 Members</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Maximum Capacity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  max="1000"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Registration Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Rules */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rules & Guidelines (One per line)
              </label>
              <textarea
                name="rulesText"
                rows={4}
                value={formData.rulesText}
                onChange={handleChange}
                placeholder="Enter rules separated by line breaks..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/organizer/dashboard")}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
