#docker build -t cifarm/rest-api-gateway -f ./apps/rest-api-gateway/Dockerfile . & docker push cifarm/rest-api-gateway
#

# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.5.0

# Build Stage
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Copy only necessary files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy remaining source code and build the application
COPY . .
RUN npx nest build rest-api-gateway

# Production Stage (final image)
FROM build AS production

# Copy only the build output and proto files
COPY --from=build /usr/src/app/dist/apps/rest-api-gateway .
COPY --from=build /usr/src/app/proto ./proto

# Install only production dependencies
RUN npm i --production

# Run as non-root user
USER node

# Start the application
CMD ["node", "main"]