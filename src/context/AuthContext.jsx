import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

const formatRole = (rawRole) => {
  if (!rawRole) return null;
  const r = rawRole.toUpperCase();
  if (r === "STUDENT") return "Student";
  if (r === "ORGANIZER") return "Organizer";
  if (r === "ADMIN") return "Admin";
  return rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const profile = await authService.getMe();
          setCurrentUser(profile);
        } catch (err) {
          console.warn("Failed to fetch current user profile with token:", err.message);
          authService.logout();
          setCurrentUser(null);
        }
      } else {
        const storedUser = authService.getCurrentUser();
        setCurrentUser(storedUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const switchRole = async (roleName) => {
    const updated = await authService.switchRole(roleName);
    setCurrentUser(updated);
    return updated;
  };

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    setCurrentUser(result.user);
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    setCurrentUser(result.user);
    return result;
  };

  const loginAs = (userObj) => {
    const updated = authService.setCurrentUser(userObj);
    setCurrentUser(updated);
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const normalizedRole = formatRole(currentUser?.role);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: normalizedRole,
        loading,
        login,
        register,
        switchRole,
        loginAs,
        logout,
        demoAccounts: authService.getDemoAccounts()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

