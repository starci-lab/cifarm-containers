#docker build -t cifarm/cron-scheduler -f ./apps/cron-scheduler/Dockerfile .
#docker push cifarm/cron-scheduler

# syntax=docker/dockerfile:1
ARG NODE_VERSION=21.6.2

# Stage 1: Build Stage
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Copy only package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN npm ci

# Copy the application source code (only necessary files)
COPY . .
RUN npx nest build cron-scheduler

# Stage 2: Final Image
FROM node:${NODE_VERSION}-alpine AS final

WORKDIR /usr/src/app

# Use production node environment by default
ENV NODE_ENV=production

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app/dist/apps/cron-scheduler ./dist

# Set the application to run as a non-root user
RUN chown -R node:node ./dist

# Set the application to run as a non-root user
USER node

# Run the application
CMD ["node", "dist/main"]

