import api from "./api";

const getDashboard = () => api.get("/dashboard");

const dashboardService = { getDashboard };

export default dashboardService;