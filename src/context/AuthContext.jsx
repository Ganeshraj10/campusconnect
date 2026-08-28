import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  const switchRole = (roleName) => {
    const updated = authService.switchRole(roleName);
    setCurrentUser(updated);
  };

  const loginAs = (userObj) => {
    const updated = authService.setCurrentUser(userObj);
    setCurrentUser(updated);
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser ? currentUser.role : null,
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
