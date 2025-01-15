#docker build -t cifarm/telegram-bot -f ./apps/telegram-bot/Dockerfile . & docker push cifarm/telegram-bot
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
RUN npx nest build telegram-bot

# Production Stage (final image)
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /usr/src/app

# Copy only the build output and proto files
COPY --from=build /usr/src/app/dist/apps/telegram-bot .

# Install only production dependencies
RUN npm i  --production

# Run as non-root user
USER node

# Start the application
CMD ["node", "main"]