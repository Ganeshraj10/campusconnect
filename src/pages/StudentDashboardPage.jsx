import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { eventService } from "../services/eventService";
import DashboardCard from "../components/common/DashboardCard";
import LoadingState from "../components/common/LoadingState";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarDays,
  BookmarkCheck,
  Award,
  ArrowRight,
  User,
  GraduationCap
} from "lucide-react";

export default function StudentDashboardPage() {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const data = await eventService.getMyEvents(currentUser?.id || "usr-std-1");
        setRegistrations(data);
      } catch (err) {
        console.error("Failed to load student dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [currentUser]);

  const upcomingEvents = registrations.filter(
    (item) => item.event?.status !== "completed" && item.event?.status !== "cancelled"
  );

  const completedEvents = registrations.filter(
    (item) => item.event?.status === "completed"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentUser?.name ? currentUser.name.charAt(0) : "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome, {currentUser?.name || "Student"}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentUser?.department || "Department of Computer Science"} • Reg No:{" "}
              <span className="font-mono font-semibold text-slate-700">
                {currentUser?.registerNumber || "2023CSE042"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/events"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Simple Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard
          title="Registered Events"
          value={registrations.length}
          subtitle="Total registrations on record"
          icon={BookmarkCheck}
          color="blue"
        />
        <DashboardCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          subtitle="Scheduled to attend"
          icon={CalendarDays}
          color="emerald"
        />
        <DashboardCard
          title="Completed Events"
          value={completedEvents.length}
          subtitle="Past participations"
          icon={Award}
          color="slate"
        />
      </div>

      {/* Upcoming Registered Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your Upcoming Event Passes
            </h2>
            <p className="text-xs text-slate-500">
              Events you are confirmed to attend.
            </p>
          </div>
          <Link
            to="/my-events"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View all my events →
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading dashboard..." />
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 text-center">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">
              No upcoming events registered
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Explore college events and register for free with your student ID.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-blue-700 transition"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((item) => (
              <div
                key={item.registrationId}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-sm transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mb-1.5">
                      PASS: {item.registrationId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.event.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.event.organizer}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Confirmed
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.event.startTime} - {item.event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{item.event.venue}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to={`/events/${item.event.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <span>Event Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <Link
                    to="/my-events"
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Manage Pass
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
