# syntax=docker/dockerfile:1.0-experimental
# Backend Dockerfile for Node.js/TypeScript
FROM node:22-alpine AS build

# Declare build argument for GitHub token
ARG GITHUB_NPM_PUBLISH_TOKEN

WORKDIR /app

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Copy package files and .npmrc
COPY package.json package-lock.json ./
COPY .npmrc .npmrc

# Append auth token to .npmrc and run npm install
# RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_NPM_PUBLISH_TOKEN}" >> .npmrc && \
#     npm ci && \
#     rm -f .npmrc

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
