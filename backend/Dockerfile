# Backend Dockerfile for Node.js/TypeScript
FROM node:22-alpine

WORKDIR /app

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Copy package files first for better caching
COPY package*.json ./

# Accept GitHub token as build argument (must be after COPY for proper scope)
ARG GITHUB_NPM_PUBLISH_TOKEN

# Create .npmrc with the token and install dependencies in a single RUN to ensure token is available
RUN set -eux; \
    if [ -z "$GITHUB_NPM_PUBLISH_TOKEN" ]; then \
        echo "ERROR: GITHUB_NPM_PUBLISH_TOKEN build arg is not set!"; \
        echo "Make sure the token is set in Railway environment variables"; \
        exit 1; \
    fi; \
    echo "@jackdo69:registry=https://npm.pkg.github.com" > .npmrc; \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_NPM_PUBLISH_TOKEN}" >> .npmrc; \
    npm ci; \
    rm -f .npmrc

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
