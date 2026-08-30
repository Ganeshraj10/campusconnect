import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/common/StatusBadge";
import LoadingState from "../components/common/LoadingState";
import EmptyState from "../components/common/EmptyState";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  AlertCircle,
  ExternalLink,
  Trash2,
  CalendarCheck,
  CheckCircle2
} from "lucide-react";

export default function MyEventsPage() {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "completed"
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalData, setCancelModalData] = useState(null);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getMyEvents(currentUser?.id || "usr-std-1");
      setRegistrations(data);
    } catch (err) {
      console.error("Failed to load registered events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, [currentUser]);

  const handleConfirmCancel = async () => {
    if (!cancelModalData) return;
    setCancellingId(cancelModalData.registrationId);
    try {
      await eventService.cancelRegistration(
        cancelModalData.registrationId,
        cancelModalData.event?.id
      );
      setCancelModalData(null);
      await fetchMyEvents();
    } catch (err) {
      alert("Failed to cancel registration: " + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  // Filter registrations by status or date
  const upcomingList = registrations.filter(
    (item) => item.event?.status !== "completed" && item.event?.status !== "cancelled"
  );

  const completedList = registrations.filter(
    (item) => item.event?.status === "completed" || item.event?.status === "cancelled"
  );

  const displayedList = activeTab === "upcoming" ? upcomingList : completedList;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your campus event registrations and view official registration passes.
          </p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition self-start sm:self-auto"
        >
          <span>Discover More Events</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition -mb-px flex items-center gap-2 ${
            activeTab === "upcoming"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>Upcoming Events</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
            {upcomingList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition -mb-px flex items-center gap-2 ${
            activeTab === "completed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>Completed / Past Events</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
            {completedList.length}
          </span>
        </button>
      </div>

      {/* Content Body */}
      {loading ? (
        <LoadingState message="Loading your registered events..." />
      ) : displayedList.length === 0 ? (
        <EmptyState
          title={
            activeTab === "upcoming"
              ? "You haven't registered for any events yet."
              : "No past events recorded."
          }
          description={
            activeTab === "upcoming"
              ? "Explore workshops, hackathons, and technical contests available on campus."
              : "Completed events you participated in will show up here."
          }
          actionText="Browse Upcoming Events"
          actionLink="/events"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedList.map((item) => (
            <div
              key={item.registrationId}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition flex flex-col sm:flex-row"
            >
              {/* Poster Image */}
              <div className="w-full sm:w-48 h-40 sm:h-auto bg-slate-100 relative shrink-0">
                <img
                  src={item.event.poster}
                  alt={item.event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-blue-700 shadow-xs">
                    {item.event.category}
                  </span>
                </div>
              </div>

              {/* Event & Pass Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ID: {item.registrationId}
                    </span>
                    <StatusBadge status="Confirmed" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.event.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Organized by: {item.event.organizer}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.event.startTime} - {item.event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.event.venue}</span>
                  </div>
                  {item.teamName && (
                    <div className="text-[11px] text-slate-500 font-medium pt-0.5">
                      Team: <strong className="text-slate-700">{item.teamName}</strong>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <Link
                    to={`/events/${item.event.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <span>View Event</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  {activeTab === "upcoming" && (
                    <button
                      type="button"
                      onClick={() => setCancelModalData(item)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-md transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Cancel Registration</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Cancel Registration?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel your registration for{" "}
                <strong className="text-slate-800">{cancelModalData.event.name}</strong>? Your seat will be released for other students.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalData(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Keep Registration
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancellingId !== null}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition"
              >
                {cancellingId ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
