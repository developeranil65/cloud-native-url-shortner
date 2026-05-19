// Runtime Environment Configuration
// This module provides runtime environment variables that can be injected at
// container startup (via window.__ENV__), rather than being baked in at build
// time by Vite. This is critical for Docker deployments where the
// API URL differs per environment.
//
// Priority: window.__ENV__ (runtime) > import.meta.env (build-time) > defaults
const env = {
  // The base URL for the backend API (e.g., "http://backend:5000/api")
  // In Docker Compose, Nginx proxies /api to the backend service, so we use "/api"
  // In development, Vite's proxy handles it, so we also use "/api"
  API_BASE_URL: window.__ENV__?.API_BASE_URL
    || import.meta.env.VITE_API_BASE_URL
    || '/api',

  // The public-facing base URL for generating shareable short links
  // In production this would be the domain (e.g., "https://short.example.com")
  // When empty, the app uses the current browser origin
  BASE_URL: window.__ENV__?.BASE_URL
    || import.meta.env.VITE_BASE_URL
    || '',
};

export default env;
