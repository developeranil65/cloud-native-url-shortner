# =============================================================================
# Stage 1: Install dependencies
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# =============================================================================
# Stage 2: Production image
# =============================================================================
FROM node:20-alpine AS production

# Add labels for container metadata
LABEL maintainer="cloudlink-team"
LABEL description="Cloud Native URL Shortener - Backend API"
LABEL version="1.0.0"

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 appuser

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 5000

# Health check to verify the container is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/health || exit 1

# Start the application
CMD ["node", "server.js"]
