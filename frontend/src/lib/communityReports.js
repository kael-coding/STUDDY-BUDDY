import axios from "axios";

const api = "/api/community";
const credentials = { withCredentials: true };

export const submitPostReport = (postId, reason) =>
    axios.post(`${api}/posts/${encodeURIComponent(postId)}/reports`, { reason }, credentials);

export const getPostReports = async () => {
    const { data } = await axios.get(`${api}/reports`, credentials);
    return data.reports;
};

export const decidePostReport = (reportId, decision) =>
    axios.patch(`${api}/reports/${reportId}`, { decision }, credentials);
