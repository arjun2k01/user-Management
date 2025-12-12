// src/config.js
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://user-management-uxdt.onrender.com/api"
    : "http://localhost:5000/api");
