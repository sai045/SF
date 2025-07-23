import axios from "axios";
const API_URL = "http://localhost:5001/api/users";

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  // The response from the server should contain the token.
  if (response.data && response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data && response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
};

const authService = {
  register,
  login,
  logout,
};

export default authService;
