// Centralized API base URL for all backend requests.
// In production (Render), set the VITE_API_URL environment variable to the backend URL.
// Locally it falls back to http://localhost:8080.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
