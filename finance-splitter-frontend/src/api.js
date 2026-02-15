import axios from "axios";

const API_BASE = "http://localhost:5000/api"; // your backend URL

export const registerUser = async (userData) => {
  const res = await axios.post(`${API_BASE}/auth/register`, userData);
  return res.data; // { token, user } etc.
};

export const loginUser = async (userData) => {
  const res = await axios.post(`${API_BASE}/auth/login`, userData);
  return res.data; // { token, user }
};