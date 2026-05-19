# Cloud Native URL Shortener - Backend

Production-ready REST API for the Cloud Native URL Shortener, built with Node.js, Express, and MongoDB.

## Features

- Shorten long URLs with unique short codes
- Redirect short codes to original URLs
- Track click analytics per URL
- Prometheus metrics endpoint (`/metrics`)
- Health check endpoint (`/health`)
- Rate limiting, security headers (Helmet), CORS
- Async error handling middleware

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Metrics:** prom-client
- **Security:** helmet, cors, express-rate-limit

## Setup

```bash
npm install
cp .env.example .env   # Edit with your values
npm run dev             # Development (auto-reload)
npm start               # Production
```

## Environment Variables

| Variable     | Description                    | Example                                    |
|-------------|--------------------------------|--------------------------------------------|
| `PORT`      | Server port                    | `5000`                                     |
| `MONGO_URI` | MongoDB connection string      | `mongodb://mongodb:27017/url-shortener`    |
| `BASE_URL`  | Public URL for generated links | `http://backend:5000`                      |
| `NODE_ENV`  | Environment mode               | `production`                               |

> **Important:** Use Docker service names or Kubernetes service names in `MONGO_URI` and `BASE_URL`. Do not hardcode `localhost`.

## API Endpoints

| Method | Path             | Description                     |
|--------|------------------|---------------------------------|
| POST   | `/api/shorten`   | Create a shortened URL          |
| GET    | `/api/urls`      | List all URLs with statistics   |
| GET    | `/:shortCode`    | Redirect to original URL        |
| GET    | `/health`        | Application health check        |
| GET    | `/metrics`       | Prometheus metrics               |

### Example: Shorten a URL

```bash
curl -X POST http://<host>:5000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com/very-long-url"}'
```

Response:
```json
{
  "originalUrl": "https://example.com/very-long-url",
  "shortCode": "abc123",
  "shortUrl": "http://<host>:5000/abc123"
}
```
