import axios from 'axios';
import env from '../config/env';

// Create Axios instance using runtime environment config
// The base URL is resolved at runtime, not baked at build time
const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const urlService = {
  shortenUrl: async (originalUrl) => {
    const response = await api.post('/shorten', { originalUrl });
    return response.data;
  },
  getUrls: async () => {
    const response = await api.get('/urls');
    return response.data;
  },
};

export default api;
