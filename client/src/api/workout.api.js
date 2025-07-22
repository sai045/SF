import axios from "axios";
const API_URL = "http://localhost:5001/api/workouts/";

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

// Get a single workout by its ID
export const getWorkout = async (id) => {
  const response = await apiClient.get(id);
  return response.data;
};

// Log a completed workout session
export const logWorkout = async (logData) => {
  const response = await apiClient.post("log", logData);
  return response.data;
};
