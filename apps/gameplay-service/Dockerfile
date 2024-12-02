# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.6.2

# Base image for installing dependencies
FROM node:${NODE_VERSION}-alpine AS deps

# Set working directory
WORKDIR /usr/src/app

# Install necessary build tools and dependencies
RUN apk add --no-cache libc6-compat

# Copy only dependency files for cache efficiency
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Build stage for application
FROM node:${NODE_VERSION}-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Install necessary tools and dev dependencies
RUN apk add --no-cache libc6-compat

# Copy dependency files again
COPY package*.json ./

# Install all dependencies (including dev dependencies) for building
RUN npm ci

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy the full source code
COPY . .

# Build the application
RUN nest build gameplay-service

# Final stage for production
FROM node:${NODE_VERSION}-alpine AS final

# Set working directory
WORKDIR /usr/src/app

# Install necessary runtime libraries
RUN apk add --no-cache libc6-compat

# Set environment to production
ENV NODE_ENV production

# Copy only the built artifacts and production dependencies
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist/apps/gameplay-service ./dist

# Create a non-root user and set permissions
RUN addgroup --system --gid 1001 node && adduser --system --uid 1001 --ingroup node node
USER node

# Expose the port (optional)
EXPOSE 3000

# Run the application
CMD ["node", "dist/main"]
