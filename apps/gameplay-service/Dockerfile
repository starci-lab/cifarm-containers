#docker build -t cifarm/gameplay-service -f ./apps/gameplay-service/Dockerfile .
#docker push cifarm/gameplay-service

# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine as build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY . .
RUN npm config set registry http://registry.npmjs.org/
RUN npm ci
RUN npx nest build gameplay-service

FROM build as deps
COPY --from=build /usr/src/app/dist/apps/gameplay-service .
COPY proto ./proto
RUN npm i --omit=dev

CMD ["node", "main"]