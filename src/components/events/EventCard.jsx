import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export default function EventCard({ event }) {
  if (!event) return null;

  const isFull = event.availableSeats === 0 || event.status === "full";
  const isClosed = event.status === "closed";

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col h-full group">
      {/* Poster */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={event.poster}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-blue-700 shadow-xs border border-white">
            {event.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Organizer */}
        <p className="text-xs font-medium text-blue-600 mb-1 truncate">
          {event.organizer}
        </p>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
          {event.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Metadata Details */}
        <div className="space-y-1.5 text-xs text-slate-600 mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{event.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500">
                {event.teamSize}
              </span>
            </div>
            
            <div className="text-[11px] font-semibold">
              {isFull ? (
                <span className="text-rose-600">Housefull</span>
              ) : isClosed ? (
                <span className="text-slate-500">Closed</span>
              ) : (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">
                  {event.availableSeats} seats left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3">
          <Link
            to={`/events/${event.id}`}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-600 transition"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
