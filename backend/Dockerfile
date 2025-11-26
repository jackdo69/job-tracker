# Backend Dockerfile for Node.js/TypeScript
FROM node:22-alpine

WORKDIR /app

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Accept GitHub token as build argument
ARG GITHUB_NPM_PUBLISH_TOKEN

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Install ALL dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Remove .npmrc to avoid exposing credentials in image
RUN rm -f .npmrc

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
