# docker build -t cifarm/cli -f ./apps/cli/Dockerfile . & docker push cifarm/cli
# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.5.0

# Build Stage
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Copy only necessary files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --force

# Copy remaining source code and build the application
COPY . .
RUN npx nest build cli

# Production Stage (final image)
FROM node:${NODE_VERSION}-alpine AS production

# Download and install MongoDB Database Tools
RUN apk add --no-cache \
    --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing \
    mongodb-tools \
 && chmod +x /usr/bin/mongo* || true
# Download 7z
RUN apk update && apk add --no-cache p7zip

# Set the path to the MongoDB Database Tools
ENV PATH="/usr/bin:/usr/local/bin:${PATH}"

# Verify installation
RUN mongodump --version
RUN 7z

WORKDIR /usr/src/app

# Copy only the build output and proto files
COPY --from=build /usr/src/app/dist/apps/cli .

# Install only production dependencies
RUN npm i  --production --force \
&& echo "#!/usr/bin/env node" | cat - main.js > temp && mv temp main.js \
&& chmod +x main.js \
&& npm install  -g .

# # Run as non-root user
USER node

# Start the application
CMD ["sleep", "infinity"]