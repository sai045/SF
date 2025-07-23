import axios from "axios";
const API_URL = "http://localhost:5001/api/activity";

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

export const logSteps = async (stepsData) => {
  const response = await apiClient.post("/steps", stepsData);
  return response.data;
};
