import axios from "axios";
const API_URL = "http://localhost:5001/api/habits";

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

export const getHabits = async () => {
  const response = await apiClient.get("/");
  return response.data;
};

export const createHabit = async (name) => {
  const response = await apiClient.post("/", { name });
  return response.data;
};

export const checkinHabit = async (habitId) => {
  const response = await apiClient.post(`/${habitId}/checkin`);
  return response.data;
};
