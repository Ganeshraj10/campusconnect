import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { eventService } from "../services/eventService";
import DashboardCard from "../components/common/DashboardCard";
import StatusBadge from "../components/common/StatusBadge";
import LoadingState from "../components/common/LoadingState";
import {
  ShieldCheck,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Check,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({
    totalUsers: 450,
    totalEvents: 10,
    pendingEvents: 0,
    totalRegistrations: 460
  });
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [eventsList, metricData] = await Promise.all([
        eventService.getEvents(),
        eventService.getAdminMetrics()
      ]);
      setAllEvents(eventsList);
      setMetrics(metricData);
    } catch (err) {
      console.error("Failed to load admin dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await eventService.updateEventApproval(id, "upcoming");
      await fetchAdminData();
    } catch (err) {
      alert("Error approving event: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    try {
      await eventService.updateEventApproval(id, "rejected");
      await fetchAdminData();
    } catch (err) {
      alert("Error rejecting event: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetData = () => {
    if (window.confirm("Reset all event & registration data back to initial sample state?")) {
      eventService.resetToDefaults();
      fetchAdminData();
    }
  };

  const pendingEvents = allEvents.filter((e) => e.status === "pending");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              System Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome, <strong className="text-slate-700">{currentUser?.name || "Admin"}</strong> ({currentUser?.department || "Dean of Student Affairs"})
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition self-start sm:self-auto"
          title="Restore sample mock events"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Total Users"
          value={metrics.totalUsers}
          subtitle="Enrolled campus students"
          icon={Users}
          color="slate"
        />
        <DashboardCard
          title="Total Events"
          value={allEvents.length}
          subtitle="Across all departments"
          icon={Calendar}
          color="blue"
        />
        <DashboardCard
          title="Pending Events"
          value={pendingEvents.length}
          subtitle="Awaiting administrative approval"
          icon={AlertTriangle}
          color="amber"
        />
        <DashboardCard
          title="Total Registrations"
          value={metrics.totalRegistrations}
          subtitle="Confirmed student entries"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Pending Events Section (if any) */}
      {pendingEvents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Pending Event Approvals ({pendingEvents.length})</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white rounded-lg border border-amber-200 overflow-hidden text-xs">
              <thead className="bg-amber-100/60 text-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Event</th>
                  <th className="py-2.5 px-3">Organizer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Venue</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900">{ev.name}</td>
                    <td className="py-3 px-3 text-slate-600">{ev.organizer}</td>
                    <td className="py-3 px-3">{ev.date}</td>
                    <td className="py-3 px-3">{ev.venue}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(ev.id)}
                        disabled={actionLoadingId === ev.id}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(ev.id)}
                        disabled={actionLoadingId === ev.id}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-xs shadow-xs"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Events Management Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Campus Events Directory
            </h2>
            <p className="text-xs text-slate-500">
              Full administrative view of active and archived college events.
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading admin event directory..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Event Name</th>
                  <th className="py-3.5 px-4">Organizer</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Registrations / Cap</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      <Link
                        to={`/events/${event.id}`}
                        className="hover:text-blue-600 transition"
                      >
                        {event.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{event.organizer}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {event.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{event.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-blue-700">{event.registeredCount}</span>
                      <span className="text-slate-400"> / {event.capacity}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap space-x-1.5">
                      <Link
                        to={`/events/${event.id}`}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded inline-block"
                        title="View Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {event.status === "rejected" ? (
                        <button
                          onClick={() => handleApprove(event.id)}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200"
                        >
                          Re-approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReject(event.id)}
                          className="px-2 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200"
                        >
                          Revoke
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
    </div>
  );
}
