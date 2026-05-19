# =============================================================================
# Stage 1: Install dependencies
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# =============================================================================
# Stage 2: Build the production bundle
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Vite production bundle
RUN npm run build

# =============================================================================
# Stage 3: Serve with Nginx
# =============================================================================
FROM nginx:1.27-alpine AS production

LABEL maintainer="cloudlink-team"
LABEL description="Cloud Native URL Shortener - Frontend"
LABEL version="1.0.0"

# Remove the default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy the nginx config as a TEMPLATE (envsubst will process it at startup)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the entrypoint script that generates runtime env config
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Environment variables with sensible defaults
# These can be overridden in docker-compose.yml or Kubernetes manifests
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=5000
ENV API_BASE_URL=/api
ENV BASE_URL=

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
