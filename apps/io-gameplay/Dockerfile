#docker build -t cifarm/io-gameplay -f ./apps/io-gameplay/Dockerfile . & docker push cifarm/io-gameplay
# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.5.0

# Build Stage
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Copy only necessary files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy remaining source code and build the application
COPY . .
RUN npx nest build io-gameplay

# Production Stage (final image)
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /usr/src/app

# Copy only the build output and proto files
COPY --from=build /usr/src/app/dist/apps/io-gameplay .

# Install only production dependencies
RUN npm i --ignore-scripts --production

# Run as non-root user
USER node

# Start the application
CMD ["node", "main"]