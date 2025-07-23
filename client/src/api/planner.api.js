import axios from "axios";
const API_URL = `https://solo-fit-server.onrender.com/api/planner`;

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

// Endpoint for all dashboard data
export const getDashboardData = async () => {
  const response = await apiClient.get("/dashboard");
  return response.data;
};
