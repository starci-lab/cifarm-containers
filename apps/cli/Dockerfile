#docker build -t cifarm/cli -f ./apps/cli/Dockerfile . & docker push cifarm/cli
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
RUN npx nest build cli

# Production Stage (final image)
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /usr/src/app

# Copy only the build output and proto files
COPY --from=build /usr/src/app/dist/apps/cli .

# Install only production dependencies
RUN npm i --production

# Add the shebang line to the main.js file
RUN echo "#!/usr/bin/env node" | cat - main.js > temp && mv temp main.js
# Make the main.js file executable
RUN chmod +x main.js
# Add the main.js file to the PATH
RUN npm install -g .

# Make a directory for the database
RUN mkdir db
# Allow the node user to write to the database directory
RUN chown node:node db

# # Run as non-root user
USER node

# Start the application
CMD ["sleep", "infinity"]