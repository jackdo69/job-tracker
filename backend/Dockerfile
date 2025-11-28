# syntax=docker/dockerfile:1.0-experimental
# Backend Dockerfile for Node.js/TypeScript
FROM node:22-alpine AS build

WORKDIR /app

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package.json package-lock.json ./

# Run npm install
RUN npm ci

# Copy TypeScript source and config
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src
COPY drizzle ./drizzle

# Build TypeScript
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose port (Railway typically assigns PORT via environment variable)
EXPOSE 8080

# Run migrations and start server (use compiled JS for migrations)
CMD ["sh", "-c", "npm run db:migrate:prod && npm start"]
