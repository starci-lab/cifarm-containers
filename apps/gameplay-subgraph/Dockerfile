#docker build -t cifarm/gameplay-subgraph -f ./apps/gameplay-subgraph/Dockerfile .
#docker push cifarm/gameplay-subgraph

# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.6.2

# Build Stage
FROM node:${NODE_VERSION}-alpine as build

WORKDIR /usr/src/app

# Copy only necessary files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm config set registry http://registry.npmjs.org/ && npm ci

# Copy remaining source code and build the application
COPY . .
RUN npx nest build gameplay-subgraph

# Production Stage (final image)
FROM node:${NODE_VERSION}-alpine as production

WORKDIR /usr/src/app

# Copy only the build output and proto files
COPY --from=build /usr/src/app/dist/apps/gameplay-subgraph .
COPY --from=build /usr/src/app/proto ./proto

# Install only production dependencies
RUN npm i --production

# Start the application
CMD ["node", "main"]
