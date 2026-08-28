const DEMO_ACCOUNTS = {
  Student: {
    id: "usr-std-1",
    name: "Alex Johnson",
    email: "alex.j@college.edu",
    registerNumber: "2023CSE042",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    phone: "9876543210",
    role: "Student"
  },
  Organizer: {
    id: "usr-org-1",
    name: "Prof. Rajesh Kumar",
    email: "rajesh.k@college.edu",
    department: "Tech Club Coordinator",
    role: "Organizer"
  },
  Admin: {
    id: "usr-adm-1",
    name: "Dr. Anita Sharma",
    email: "dean.events@college.edu",
    department: "Dean of Student Affairs",
    role: "Admin"
  }
};

const AUTH_STORAGE_KEY = "campusconnect_current_user";

export const authService = {
  getDemoAccounts: () => DEMO_ACCOUNTS,

  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
    }
    // Default to Student demo account
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_ACCOUNTS.Student));
    return DEMO_ACCOUNTS.Student;
  },

  setCurrentUser: (user) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  switchRole: (roleName) => {
    const targetUser = DEMO_ACCOUNTS[roleName] || DEMO_ACCOUNTS.Student;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser));
    return targetUser;
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};
