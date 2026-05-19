# Cloud Native URL Shortener - Frontend

Modern, dark-themed SaaS dashboard built with React, Vite, and Tailwind CSS.

## Features

- Dark-themed professional dashboard UI
- URL shortening form with validation and loading states
- Analytics table with click tracking
- Copy-to-clipboard with toast notifications
- Fully responsive design
- Runtime environment configuration (no hardcoded URLs)

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3
- **API Client:** Axios
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## Development Setup

```bash
npm install
npm run dev     # Starts on port 5173 with API proxy to backend
```

The Vite dev server proxies `/api` requests to the backend automatically (configured in `vite.config.js`).

## Environment Configuration

### Build-time (Vite)

The `.env` file provides build-time defaults:
```env
VITE_API_BASE_URL=/api
```

### Runtime (Docker/Kubernetes)

In containerized deployments, environment variables are injected at startup via `docker-entrypoint.sh`:

| Variable       | Description                         | Default  |
|---------------|--------------------------------------|----------|
| `BACKEND_HOST` | Backend service name for Nginx proxy | `backend` |
| `BACKEND_PORT` | Backend port for Nginx proxy         | `5000`    |
| `API_BASE_URL` | API path used by the React app       | `/api`    |
| `BASE_URL`     | Public URL for short link display    | *(empty, uses browser origin)* |

> **No localhost references**: The frontend uses relative paths (`/api`) and the Nginx reverse proxy handles routing to the backend service by name.
