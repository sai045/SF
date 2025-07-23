import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../api/auth.api";
import { getDashboardData } from "../api/planner.api";
import LevelUpModal from "../components/common/LevelUpModal";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  const refreshDashboardSummary = async () => {
    if (localStorage.getItem("user")) {
      try {
        const data = await getDashboardData();
        setDashboardSummary(data);
      } catch (error) {
        console.error("Failed to refresh dashboard data", error);
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      refreshDashboardSummary(); // Fetch initial dashboard data on load
    }
    setLoading(false);
  }, []);

  const updateFullUserState = (newUserData) => {
    // This function completely replaces the user state, for login/register/profile updates
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
    refreshDashboardSummary();
  };

  const updateUserStats = (updatedStats) => {
    const currentUserData = JSON.parse(localStorage.getItem("user"));

    // --- CHECK FOR LEVEL UP ---
    if (updatedStats.level > currentUserData.level) {
      setLevelUpInfo({
        oldLevel: currentUserData.level,
        newLevel: updatedStats.level,
      });
    }

    const updatedData = { ...currentUserData, ...updatedStats };
    localStorage.setItem("user", JSON.stringify(updatedData));
    setUser(updatedData);
    refreshDashboardSummary();
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
    dashboardSummary,
    refreshDashboardSummary,
  };

  return (
    <AuthContext.Provider value={value}>
      {levelUpInfo && (
        <LevelUpModal
          oldLevel={levelUpInfo.oldLevel}
          newLevel={levelUpInfo.newLevel}
          onClose={() => setLevelUpInfo(null)}
        />
      )}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
