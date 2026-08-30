import api from "./api";

const DEMO_CREDENTIALS = {
  Student: {
    email: "alex.j@college.edu",
    password: "password123",
    role: "Student",
    name: "Alex Johnson",
    registerNumber: "2023CSE042",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    phone: "9876543210"
  },
  Organizer: {
    email: "rajesh.k@college.edu",
    password: "password123",
    role: "Organizer",
    name: "Prof. Rajesh Kumar",
    department: "Tech Club Coordinator / CSE Faculty"
  },
  Admin: {
    email: "dean.events@college.edu",
    password: "password123",
    role: "Admin",
    name: "Dr. Anita Sharma",
    department: "Dean of Student Affairs"
  }
};

const AUTH_STORAGE_KEY = "campusconnect_current_user";
const TOKEN_STORAGE_KEY = "campusconnect_token";

export const authService = {
  getDemoAccounts: () => DEMO_CREDENTIALS,

  getCurrentUser: () => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedUser && token && token !== "null" && token !== "undefined" && token !== "mock-token") {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
    }
    return null;
  },


  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return user;
  },

  getToken: () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token || token === "null" || token === "undefined" || token === "mock-token") {
      return "";
    }
    return token;
  },


  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, token } = res.data.data;
    
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { user, token };
  },

  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    const { user, token } = res.data.data;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { user, token };
  },

  getMe: async () => {
    const res = await api.get("/auth/me");
    const user = res.data.data;
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  },

  switchRole: async (roleName) => {
    const creds = DEMO_CREDENTIALS[roleName] || DEMO_CREDENTIALS.Student;
    const res = await api.post("/auth/login", {
      email: creds.email,
      password: creds.password
    });
    const { user, token } = res.data.data;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
};

