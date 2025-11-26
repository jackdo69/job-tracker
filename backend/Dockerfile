# syntax=docker/dockerfile:1.0-experimental
# Backend Dockerfile for Node.js/TypeScript
FROM node:22-alpine AS build

# Declare an argument to receive the token during the build
ARG GITHUB_NPM_PUBLISH_TOKEN

# Set the GITHUB_NPM_PUBLISH_TOKEN environment variable within the container
ENV GITHUB_NPM_PUBLISH_TOKEN=${GITHUB_NPM_PUBLISH_TOKEN}

WORKDIR /app

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Copy package files and the .npmrc file
COPY package.json package-lock.json ./
COPY .npmrc .npmrc

# Run npm install, which will use the token from the environment variable
RUN npm ci

# Remove the .npmrc file for security, once packages are installed
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
