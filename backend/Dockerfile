# Backend Dockerfile for Node.js/TypeScript
FROM node:22-alpine

WORKDIR /app

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript source and config
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src
COPY drizzle ./drizzle

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "npm run db:migrate && npm start"]
