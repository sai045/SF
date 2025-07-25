import axios from "axios";
const API_URL = `http://localhost:5001/api/sessions`;

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

export const startWorkoutSession = async (workoutId) => {
  const response = await apiClient.post("/start", { workoutId });
  return response.data;
};

export const getWorkoutSession = async (sessionId) => {
  const response = await apiClient.get(`/${sessionId}`);
  return response.data;
};

export const updateWorkoutSession = async (sessionId, updateData) => {
  const response = await apiClient.put(`/${sessionId}`, updateData);
  return response.data;
};

export const finishWorkoutSession = async (sessionId) => {
  const response = await apiClient.post(`/${sessionId}/finish`);
  return response.data;
};
