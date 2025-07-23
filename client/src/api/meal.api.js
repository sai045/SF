import axios from "axios";
const API_URL = "http://localhost:5001/api/meals";

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

export const searchIngredients = async (query) => {
  const response = await apiClient.get(`/ingredients/search?q=${query}`);
  return response.data;
};

export const logCustomMeal = async (logData) => {
  const response = await apiClient.post("/log_custom", logData);
  return response.data;
};

export const getMealTemplates = async () => {
  const response = await apiClient.get("/templates");
  return response.data;
};

export const prepareTemplateForLogging = async (templateId) => {
  const response = await apiClient.post("/templates/prepare", { templateId });
  return response.data;
};
