import axios from "axios";
const API_URL = `http://localhost:5001/api/workouts`;

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

export const getWorkout = async (id) => {
  const response = await apiClient.get(`/${id}`);
  return response.data;
};

export const logWorkout = async (logData) => {
  const response = await apiClient.post("/log", logData);
  return response.data;
};

export const getExerciseHistory = async (exerciseName) => {
  // We must encode the exercise name in case it has special characters like '/' or ' '
  const response = await apiClient.get(
    `/history/${encodeURIComponent(exerciseName)}`
  );
  return response.data;
};

export const getWorkoutHistoryList = async () => {
  const response = await apiClient.get("/history/all");
  return response.data;
};

export const getWorkoutLogDetails = async (logId) => {
  const response = await apiClient.get(`/history/log/${logId}`);
  return response.data;
};

export const createCustomWorkout = async (workoutData) => {
  const response = await apiClient.post("/custom", workoutData);
  return response.data;
};

export const getMyWorkouts = async () => {
  const response = await apiClient.get("/custom");
  return response.data;
};
