# syntax=docker/dockerfile:1
ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Copy the source code
COPY . .
RUN npx nest build gameplay-service

# Create a new stage for running the application
FROM build as final

# Use production node environment by default.
ENV NODE_ENV production

# Copy the minimal files needed to run the application.
COPY package.json .
COPY --from=build /usr/src/app/dist/apps/gameplay-service ./dist

RUN chown -R node:node /usr/src/app/dist

# Run the application as a non-root user.
USER node

# Run the application.
CMD ["node", "dist/main"]
