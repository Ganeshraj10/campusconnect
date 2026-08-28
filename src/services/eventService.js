import { INITIAL_EVENTS } from "../data/events";

const EVENTS_STORAGE_KEY = "campusconnect_events";
const REGISTRATIONS_STORAGE_KEY = "campusconnect_registrations";

// Initialize mock events in localStorage if not already set
const initializeEvents = () => {
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error reading events from localStorage", e);
    return INITIAL_EVENTS;
  }
};

// Initial mock registration for demo student
const INITIAL_REGISTRATIONS = [
  {
    id: "CC-2026-8492",
    eventId: "ev-1",
    userId: "usr-std-1",
    studentName: "Alex Johnson",
    registerNumber: "2023CSE042",
    email: "alex.j@college.edu",
    phone: "9876543210",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    teamName: "CodeCrafters",
    teamMembers: "Alex Johnson, Ryan Davis, Priya Sharma",
    registeredAt: "2026-08-25T14:30:00Z",
    status: "Confirmed"
  },
  {
    id: "CC-2026-3109",
    eventId: "ev-4",
    userId: "usr-std-1",
    studentName: "Alex Johnson",
    registerNumber: "2023CSE042",
    email: "alex.j@college.edu",
    phone: "9876543210",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    teamName: "",
    teamMembers: "",
    registeredAt: "2026-08-26T10:15:00Z",
    status: "Confirmed"
  }
];

const initializeRegistrations = () => {
  try {
    const stored = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
      return INITIAL_REGISTRATIONS;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error reading registrations from localStorage", e);
    return INITIAL_REGISTRATIONS;
  }
};

export const eventService = {
  // GET all events
  getEvents: async () => {
    // Simulated micro-delay for realistic UI loading state
    return new Promise((resolve) => {
      setTimeout(() => {
        const events = initializeEvents();
        resolve(events);
      }, 100);
    });
  },

  // GET single event by ID
  getEventById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const events = initializeEvents();
        const found = events.find((e) => e.id === id);
        resolve(found || null);
      }, 80);
    });
  },

  // Search events by name, description, venue, or organizer
  searchEvents: async (query) => {
    return new Promise((resolve) => {
      const events = initializeEvents();
      if (!query || query.trim() === "") {
        resolve(events);
        return;
      }
      const q = query.toLowerCase().trim();
      const filtered = events.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
      resolve(filtered);
    });
  },

  // Filter events by category
  filterEvents: async (category) => {
    return new Promise((resolve) => {
      const events = initializeEvents();
      if (!category || category === "All") {
        resolve(events);
        return;
      }
      const filtered = events.filter(
        (e) => e.category.toLowerCase() === category.toLowerCase()
      );
      resolve(filtered);
    });
  },

  // Check if a user is registered for a specific event
  isUserRegistered: async (eventId, userId = "usr-std-1") => {
    const regs = initializeRegistrations();
    return regs.some((r) => r.eventId === eventId && r.userId === userId && r.status === "Confirmed");
  },

  // Register for an event (Free)
  registerForEvent: async (eventId, formData, userId = "usr-std-1") => {
    return new Promise((resolve, reject) => {
      const events = initializeEvents();
      const eventIndex = events.findIndex((e) => e.id === eventId);
      
      if (eventIndex === -1) {
        reject(new Error("Event not found"));
        return;
      }

      const event = events[eventIndex];
      if (event.availableSeats <= 0) {
        reject(new Error("Registration is full for this event"));
        return;
      }

      const regs = initializeRegistrations();
      // Check if already registered
      const alreadyRegistered = regs.some(
        (r) => r.eventId === eventId && r.userId === userId && r.status === "Confirmed"
      );
      if (alreadyRegistered) {
        reject(new Error("You are already registered for this event."));
        return;
      }

      // Generate Registration ID (e.g., CC-2026-7391)
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const regId = `CC-2026-${randomNum}`;

      const newRegistration = {
        id: regId,
        eventId: event.id,
        userId: userId,
        studentName: formData.name,
        registerNumber: formData.registerNumber,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        teamName: formData.teamName || "",
        teamMembers: formData.teamMembers || "",
        registeredAt: new Date().toISOString(),
        status: "Confirmed"
      };

      // Update event counts
      const updatedEvent = {
        ...event,
        registeredCount: event.registeredCount + 1,
        availableSeats: Math.max(0, event.availableSeats - 1),
        status: event.availableSeats - 1 === 0 ? "full" : event.status
      };

      events[eventIndex] = updatedEvent;
      regs.push(newRegistration);

      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(regs));

      setTimeout(() => {
        resolve({
          registration: newRegistration,
          event: updatedEvent
        });
      }, 150);
    });
  },

  // Get student registered events
  getMyEvents: async (userId = "usr-std-1") => {
    return new Promise((resolve) => {
      const events = initializeEvents();
      const regs = initializeRegistrations();
      
      const userRegs = regs.filter((r) => r.userId === userId && r.status === "Confirmed");
      
      const result = userRegs.map((reg) => {
        const event = events.find((e) => e.id === reg.eventId) || {
          name: "Unknown Event",
          date: "N/A",
          startTime: "N/A",
          endTime: "N/A",
          venue: "N/A",
          poster: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
          category: "General",
          status: "completed"
        };

        return {
          registrationId: reg.id,
          registeredAt: reg.registeredAt,
          teamName: reg.teamName,
          teamMembers: reg.teamMembers,
          event: event
        };
      });

      resolve(result);
    });
  },

  // Cancel student registration
  cancelRegistration: async (registrationId) => {
    return new Promise((resolve, reject) => {
      const regs = initializeRegistrations();
      const regIndex = regs.findIndex((r) => r.id === registrationId);

      if (regIndex === -1) {
        reject(new Error("Registration record not found"));
        return;
      }

      const reg = regs[regIndex];
      const eventId = reg.eventId;

      // Mark registration cancelled or remove
      regs.splice(regIndex, 1);
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(regs));

      // Restore seat in event
      const events = initializeEvents();
      const eventIndex = events.findIndex((e) => e.id === eventId);
      if (eventIndex !== -1) {
        const ev = events[eventIndex];
        events[eventIndex] = {
          ...ev,
          registeredCount: Math.max(0, ev.registeredCount - 1),
          availableSeats: ev.availableSeats + 1,
          status: ev.status === "full" ? "upcoming" : ev.status
        };
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      }

      setTimeout(() => {
        resolve({ success: true, message: "Registration cancelled successfully." });
      }, 100);
    });
  },

  // Organizer: Create new event
  createEvent: async (eventData) => {
    return new Promise((resolve) => {
      const events = initializeEvents();
      const newId = `ev-${Date.now()}`;
      
      const newEvent = {
        id: newId,
        name: eventData.name,
        organizer: eventData.organizer || "Campus Tech Society",
        category: eventData.category || "Technical",
        poster: eventData.poster || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
        date: eventData.date,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        teamSize: eventData.teamSize || "Individual",
        description: eventData.description,
        venue: eventData.venue,
        capacity: Number(eventData.capacity) || 50,
        registeredCount: 0,
        availableSeats: Number(eventData.capacity) || 50,
        registrationDeadline: eventData.registrationDeadline,
        status: "upcoming", // or "pending" for admin workflow
        rules: eventData.rules && eventData.rules.length > 0 
          ? eventData.rules 
          : [
              "Valid college ID required.",
              "Report to venue 15 minutes prior to start time.",
              "Follow code of conduct."
            ]
      };

      events.unshift(newEvent);
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

      setTimeout(() => {
        resolve(newEvent);
      }, 150);
    });
  },

  // Organizer / Admin: Update event
  updateEvent: async (id, updatedFields) => {
    return new Promise((resolve, reject) => {
      const events = initializeEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx === -1) {
        reject(new Error("Event not found"));
        return;
      }

      events[idx] = { ...events[idx], ...updatedFields };
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      resolve(events[idx]);
    });
  },

  // Cancel / Delete event
  cancelEvent: async (id) => {
    return new Promise((resolve, reject) => {
      const events = initializeEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx === -1) {
        reject(new Error("Event not found"));
        return;
      }

      events[idx].status = "cancelled";
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      resolve(events[idx]);
    });
  },

  // Admin approval / rejection
  updateEventApproval: async (id, status) => {
    return new Promise((resolve, reject) => {
      const events = initializeEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx === -1) {
        reject(new Error("Event not found"));
        return;
      }

      events[idx].status = status; // 'upcoming' (approved) or 'rejected'
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      resolve(events[idx]);
    });
  },

  // Admin metrics
  getAdminMetrics: async () => {
    const events = initializeEvents();
    const regs = initializeRegistrations();
    
    const totalUsers = 450; // Mock college student population
    const totalEvents = events.length;
    const pendingEvents = events.filter((e) => e.status === "pending").length;
    const totalRegistrations = regs.length + events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);

    return {
      totalUsers,
      totalEvents,
      pendingEvents,
      totalRegistrations
    };
  },

  // Reset data to defaults
  resetToDefaults: () => {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
  }
};
