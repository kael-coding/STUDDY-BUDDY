import axios from "axios";

export const adminApi = axios.create({
    baseURL: "/api/admin",
    withCredentials: true,
});
