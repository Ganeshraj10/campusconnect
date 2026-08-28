import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import DashboardCard from "../components/common/DashboardCard";
import StatusBadge from "../components/common/StatusBadge";
import LoadingState from "../components/common/LoadingState";
import {
  PlusCircle,
  Calendar,
  Users,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle
} from "lucide-react";

export default function OrganizerDashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [editEventModal, setEditEventModal] = useState(null);

  const fetchOrganizerEvents = async () => {
    setLoading(true);
    try {
      const allEvents = await eventService.getEvents();
      setEvents(allEvents);
    } catch (err) {
      console.error("Failed to load organizer dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const totalEvents = events.length;
  const totalRegistrations = events.reduce(
    (sum, e) => sum + (e.registeredCount || 0),
    0
  );

  const handleCancelEvent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to cancel the event "${name}"?`)) {
      return;
    }
    setCancellingId(id);
    try {
      await eventService.cancelEvent(id);
      await fetchOrganizerEvents();
    } catch (err) {
      alert("Error cancelling event: " + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editEventModal) return;
    try {
      await eventService.updateEvent(editEventModal.id, editEventModal);
      setEditEventModal(null);
      await fetchOrganizerEvents();
    } catch (err) {
      alert("Error updating event: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Organizer Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Organizer Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as: <strong className="text-slate-700">{currentUser?.name || "Organizer"}</strong> ({currentUser?.department || "Tech Coordinator"})
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Total Events"
          value={totalEvents}
          subtitle="Managed in system"
          icon={Calendar}
          color="blue"
        />
        <DashboardCard
          title="Total Registrations"
          value={totalRegistrations}
          subtitle="Registered student count"
          icon={Users}
          color="emerald"
        />
        <DashboardCard
          title="Active / Upcoming"
          value={events.filter((e) => e.status === "upcoming").length}
          subtitle="Open for registration"
          icon={CheckCircle}
          color="blue"
        />
        <DashboardCard
          title="Full / Closed"
          value={events.filter((e) => e.status === "full" || e.status === "closed").length}
          subtitle="Reached capacity or deadline"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Events Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Managed Campus Events
            </h2>
            <p className="text-xs text-slate-500">
              Monitor student registrations, event capacity, and publication status.
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading organizer events..." />
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No events found. Click "Create Event" to schedule your first event.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Event</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-center">Registrations</th>
                  <th className="py-3.5 px-4 text-center">Capacity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={event.poster}
                          alt={event.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div>
                          <div className="font-bold text-slate-900 hover:text-blue-600">
                            {event.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                            {event.venue}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {event.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{event.date}</div>
                      <div className="text-[11px] text-slate-500">{event.startTime}</div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-blue-700">
                      {event.registeredCount}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-600 font-medium">
                      {event.capacity}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition"
                        title="View Public Page"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditEventModal(event)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-md transition"
                        title="Quick Edit"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      {event.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => handleCancelEvent(event.id, event.name)}
                          disabled={cancellingId === event.id}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Cancel Event"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {editEventModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
              Edit Event: {editEventModal.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Event Name</label>
                <input
                  type="text"
                  value={editEventModal.name}
                  onChange={(e) =>
                    setEditEventModal({ ...editEventModal, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={editEventModal.venue}
                    onChange={(e) =>
                      setEditEventModal({ ...editEventModal, venue: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={editEventModal.capacity}
                    onChange={(e) =>
                      setEditEventModal({ ...editEventModal, capacity: Number(e.target.value) })
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={editEventModal.status}
                  onChange={(e) =>
                    setEditEventModal({ ...editEventModal, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="full">Seats Full</option>
                  <option value="closed">Registration Closed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditEventModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
