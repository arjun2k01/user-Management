import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://user-management-uxdt.onrender.com"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
