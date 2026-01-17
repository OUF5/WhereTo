# Build stage - use Debian-based image for better Prisma compatibility
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

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

# Production stage - use Debian-based image
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL (required for Prisma at runtime)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs fastify

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Set ownership
RUN chown -R fastify:nodejs /app

USER fastify

# Cloud Run injects PORT env var (default 8080)
EXPOSE 8080

ENV PORT=8080

# Start the application
CMD ["node", "dist/app.js"]

