import axios from 'axios';

const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export default axiosInstance;
