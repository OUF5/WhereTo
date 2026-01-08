# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Set ownership
RUN chown -R fastify:nodejs /app

USER fastify

# Cloud Run injects PORT env var (default 8080)
# We expose 8080 but the app reads from PORT env var
EXPOSE 8080

ENV PORT=8080

# Note: Removed Docker HEALTHCHECK - Cloud Run manages its own health checks
# via startup_probe and liveness_probe configured in the service

# Start the application
CMD ["node", "dist/app.js"]

