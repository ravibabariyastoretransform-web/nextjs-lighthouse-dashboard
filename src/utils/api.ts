import axios from "axios";

// Create a configured axios instance
export const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Define dedicated API endpoint methods
export const ApiEndpoints = {
    // Audit Endpoints
    getAudits: () => api.get("/audit"),
    getAudit: (id: string) => api.get(`/audit/${id}`),
    runAudit: (url: string, simulated: boolean = true) => api.post("/audit", { url, simulated }),
    deleteAudit: (id: string) => api.delete(`/audit/${id}`),

    // Settings Endpoints
    seedSettings: () => api.post("/settings/seed"),
    resetSettings: () => api.post("/settings/reset"),
};
