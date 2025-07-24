import axios from "axios";
const API_URL = `http://localhost:5001/api/users`;

const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }
  return config;
});

export const updateUserProfile = async (profileData) => {
  const response = await apiClient.put("/profile", profileData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await apiClient.get("/profile");
  return response.data;
};

export const getProfileStats = async () => {
  const response = await apiClient.get("/profile/stats");
  return response.data;
};

export const getAchievements = async () => {
  const response = await apiClient.get("/achievements");
  return response.data;
};

export const setActiveTitle = async (titleKey) => {
  const response = await apiClient.put("/profile/title", { titleKey });
  return response.data;
};
