import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const updateFullUserState = (newUserData) => {
    // This function completely replaces the user state, for login/register/profile updates
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const updateUserStats = (updatedStats) => {
    // This function intelligently merges new stats into the existing user object
    const currentUserData = JSON.parse(localStorage.getItem("user"));
    const updatedData = { ...currentUserData, ...updatedStats };
    localStorage.setItem("user", JSON.stringify(updatedData));
    setUser(updatedData);
  };

  const login = async (email, password) => {
    const userData = await authService.login({ email, password });
    updateFullUserState(userData);
    return userData;
  };

  const register = async (username, email, password) => {
    const userData = await authService.register({ username, email, password });
    updateFullUserState(userData);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    setUser: updateFullUserState,
    updateUserStats,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
