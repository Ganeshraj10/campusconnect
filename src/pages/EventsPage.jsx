import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { eventService } from "../services/eventService";
import EventCard from "../components/events/EventCard";
import SearchBar from "../components/common/SearchBar";
import CategoryFilter from "../components/common/CategoryFilter";
import LoadingState from "../components/common/LoadingState";
import EmptyState from "../components/common/EmptyState";
import { Sparkles, Calendar } from "lucide-react";

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Sync category state if URL param changes
  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch and filter events
  const loadEvents = async () => {
    setLoading(true);
    try {
      let results = await eventService.getEvents();

      // Filter by category
      if (selectedCategory && selectedCategory !== "All") {
        results = results.filter(
          (e) => e.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        results = results.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.organizer.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q)
        );
      }

      // Filter out rejected or deleted events for students
      results = results.filter((e) => e.status !== "rejected" && e.status !== "pending");

      setEvents(results);
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Upcoming Events
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore campus workshops, hackathons, and technical contests. Free entry for all students.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="max-w-xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search events by name, organizer, topic, or venue..."
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            Filter by Category:
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{events.length}</strong> {events.length === 1 ? "event" : "events"}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>

        {(selectedCategory !== "All" || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Events Grid / States */}
      {loading ? (
        <LoadingState message="Loading college events..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description={
            searchQuery || selectedCategory !== "All"
              ? "No events matched your current search or category filter. Try clearing your filters."
              : "There are no upcoming events listed right now. Check back soon!"
          }
          actionText="Clear All Filters"
          onActionClick={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
