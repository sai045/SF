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
        // If we get a 401 here, it means the token is bad, so we should log out.
        if (error.response?.status === 401) {
          logout();
        }
      }
    }
  };

  // This function is for full state replacement (login/register)
  const setFullUser = (newUserData) => {
    if (newUserData) {
      localStorage.setItem("user", JSON.stringify(newUserData));
      setUser(newUserData);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // --- THIS IS THE NEW, SAFER FUNCTION FOR PROFILE UPDATES ---
  const updateUserProfileData = (profileUpdate) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return; // Safety check

    // Merge the new profile data with the existing user data, preserving the token
    const updatedUser = {
      ...currentUser, // Keeps the token and other client-side state
      ...profileUpdate, // Overwrites fields like username, physicalMetrics, etc.
    };

    setFullUser(updatedUser);
    refreshDashboardSummary(); // Refresh TDEE with new weight
  };

  const updateUserStats = (updatedStats) => {
    const currentUserData = JSON.parse(localStorage.getItem("user"));
    if (currentUserData.level < updatedStats.level) {
      setLevelUpInfo({
        oldLevel: currentUserData.level,
        newLevel: updatedStats.level,
      });
    }

    const updatedData = { ...currentUserData, ...updatedStats };
    setFullUser(updatedData);
    refreshDashboardSummary();
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      refreshDashboardSummary();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await authService.login({ email, password });
    setFullUser(userData);
    return userData;
  };

  const register = async (username, email, password) => {
    const userData = await authService.register({ username, email, password });
    setFullUser(userData);
    return userData;
  };

  const logout = () => {
    setFullUser(null);
  };

  const value = {
    user,
    setUser: updateUserProfileData, // The page's setUser now calls our new safe function
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
