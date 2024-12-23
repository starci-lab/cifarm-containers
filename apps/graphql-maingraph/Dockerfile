#docker build -t cifarm/graphql-maingraph -f ./apps/graphql-maingraph/Dockerfile .
#docker push cifarm/graphql-maingraph

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
RUN npx nest build graphql-maingraph

# Production Stage (final image)
FROM node:${NODE_VERSION}-alpine as production

WORKDIR /usr/src/app

# Copy only the build output and proto files
COPY --from=build /usr/src/app/dist/apps/graphql-maingraph .
COPY --from=build /usr/src/app/proto ./proto

# Install only production dependencies
RUN npm i --production

# Start the application
CMD ["node", "main"]
