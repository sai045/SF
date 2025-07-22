import axios from "axios";
const API_URL = "http://localhost:5001/api/planner/";

// Axios instance to include the auth token
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Get today's smart plan
const getTodaysPlan = async () => {
  const response = await apiClient.get("today");
  return response.data;
};

const plannerService = {
  getTodaysPlan,
};

export default plannerService;
