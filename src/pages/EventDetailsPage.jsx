import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { eventService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/common/StatusBadge";
import RegistrationModal from "../components/events/RegistrationModal";
import LoadingState from "../components/common/LoadingState";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Share2,
  CalendarCheck
} from "lucide-react";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await eventService.getEventById(id);
      if (!data) {
        setError("Event not found or has been removed.");
      } else {
        setEvent(data);
        // Check if current user is registered
        const regStatus = await eventService.isUserRegistered(
          id,
          currentUser?.id || "usr-std-1"
        );
        setIsRegistered(regStatus);
      }
    } catch (err) {
      setError("Unable to load event details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, currentUser]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegistrationSuccess = (updatedEvent) => {
    if (updatedEvent) setEvent(updatedEvent);
    setIsRegistered(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading event details..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-xl p-10 max-w-md mx-auto shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-4">{error || "Event not found"}</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.availableSeats === 0 || event.status === "full";
  const isClosed = event.status === "closed";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button & Top Meta */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all events</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? "Link Copied!" : "Share"}</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Banner / Poster */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
          <img
            src={event.poster}
            alt={event.name}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-600/90 backdrop-blur-xs text-white border border-blue-400">
                {event.category}
              </span>
              <StatusBadge status={event.status} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {event.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
              Organized by: {event.organizer}
            </p>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Main Column: Description & Rules */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                About the Event
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Rules Section */}
            {event.rules && event.rules.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Rules & Guidelines</span>
                </h2>
                <ul className="space-y-2">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Key Details & Registration Action */}
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Event Schedule & Venue
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Date</div>
                    <div className="font-semibold text-slate-800">{event.date}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Time</div>
                    <div className="font-semibold text-slate-800">{event.startTime} - {event.endTime}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Venue</div>
                    <div className="font-semibold text-slate-800">{event.venue}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Team Size</div>
                    <div className="font-semibold text-slate-800">{event.teamSize}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Registration Deadline</div>
                    <div className="font-semibold text-slate-800">{event.registrationDeadline}</div>
                  </div>
                </div>
              </div>

              {/* Seat Availability Counter */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Seats Availability:</span>
                  <span className="font-bold text-slate-800">
                    {event.availableSeats} of {event.capacity} left
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isFull ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((event.capacity - event.availableSeats) / event.capacity) * 100)
                      )}%`
                    }}
                  />
                </div>
              </div>

              {/* Action Button Section */}
              <div className="pt-2">
                {isRegistered ? (
                  <div className="space-y-2">
                    <div className="w-full py-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Registered ✓</span>
                    </div>
                    <Link
                      to="/my-events"
                      className="block text-center text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      View in My Events
                    </Link>
                  </div>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-bold cursor-not-allowed text-center"
                  >
                    Registration Full
                  </button>
                ) : isClosed ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-bold cursor-not-allowed text-center"
                  >
                    Registration Closed
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition cursor-pointer text-center"
                  >
                    Register for Free
                  </button>
                )}
                
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  100% Free • Open to all college students
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Form */}
      <RegistrationModal
        event={event}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
