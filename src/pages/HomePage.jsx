import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventService } from "../services/eventService";
import EventCard from "../components/events/EventCard";
import LoadingState from "../components/common/LoadingState";
import { 
  ArrowRight, 
  Calendar, 
  Code, 
  Wrench, 
  Trophy, 
  Sparkles, 
  Activity, 
  Layers,
  GraduationCap
} from "lucide-react";

export default function HomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      try {
        const events = await eventService.getEvents();
        // Take top 6 upcoming events
        setUpcomingEvents(events.slice(0, 6));
      } catch (err) {
        console.error("Failed to load home events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  const categoryCards = [
    { name: "Technical", desc: "Hackathons & Coding", icon: Code, color: "text-blue-600 bg-blue-50" },
    { name: "Workshop", desc: "Hands-on Learning", icon: Wrench, color: "text-indigo-600 bg-indigo-50" },
    { name: "Competition", desc: "CTF & Challenges", icon: Trophy, color: "text-amber-600 bg-amber-50" },
    { name: "Cultural", desc: "Campus Fests & Fun", icon: Sparkles, color: "text-purple-600 bg-purple-50" },
    { name: "Sports", desc: "Tournaments & Games", icon: Activity, color: "text-emerald-600 bg-emerald-50" },
    { name: "Other", desc: "Talks & Pitching", icon: Layers, color: "text-slate-600 bg-slate-100" }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/70 to-slate-50 border-b border-slate-200 py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>CampusConnect Events Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Discover College Events
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Find and register for workshops, competitions, hackathons and other campus activities.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/events"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 text-sm"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/my-events"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 transition text-sm text-center"
            >
              My Registered Events
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-2 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Upcoming Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top events happening on campus this month.
            </p>
          </div>
          <Link
            to="/events"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>View all events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading upcoming campus events..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Event Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="mb-6 pb-2 border-b border-slate-200">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Event Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse campus activities by your area of interest.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigate(`/events?category=${cat.name}`)}
                className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:border-blue-500 hover:shadow-sm transition group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {cat.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
