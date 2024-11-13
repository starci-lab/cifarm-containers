# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine as deps

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm ci --omit=dev

# Create a new stage for building the application
FROM deps as build

# Install all dependencies, including dev dependencies
COPY package*.json ./
RUN npm ci

# Install NestJS CLI globally
RUN npm i -g @nestjs/cli

# Copy the source code
COPY . .
RUN nest build gold-wallet-service

# Create a new stage for running the application
FROM build as final 

# Use production node environment by default.
ENV NODE_ENV production

# Copy the minimal files needed to run the application.
COPY package.json .
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist/apps/gold-wallet-service ./dist

RUN chown -R node:node /usr/src/app/dist

# Run the application as a non-root user.
USER node

# Run the application.
CMD ["node", "dist/main"]
