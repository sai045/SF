import axios from "axios";
const API_URL = `https://solo-fit-server.onrender.com/api/metrics`;

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

export const logBodyMetric = async (metricData) => {
  const response = await apiClient.post("/", metricData);
  return response.data;
};

export const getBodyMetricsHistory = async () => {
  const response = await apiClient.get("/");
  return response.data;
};
