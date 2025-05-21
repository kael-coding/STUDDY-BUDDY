// src/lib/axiosInstance.js
import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://studdy-buddy-production.up.railway.app/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export default axiosInstance;
