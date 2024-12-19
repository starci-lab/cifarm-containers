#docker build -t cifarm/websocket-node -f ./apps/websocket-node/Dockerfile .
#docker push cifarm/websocket-node

# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine as build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY . .
RUN npm config set registry http://registry.npmjs.org/
RUN npm ci
RUN npx nest build websocket-node

FROM build as deps
COPY --from=build /usr/src/app/dist/apps/websocket-node .
COPY proto ./proto
RUN npm i --omit=dev

CMD ["node", "main"]