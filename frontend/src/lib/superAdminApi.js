import axios from "axios";

export const adminApi = axios.create({
    baseURL: "/api/superAdmin/admin",
    withCredentials: true,
});
