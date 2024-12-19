#docker build -t cifarm/graphql-maingraph -f ./apps/graphql-maingraph/Dockerfile .
#docker push cifarm/graphql-maingraph

# syntax=docker/dockerfile:1

ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine as build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY . .
RUN npm config set registry http://registry.npmjs.org/
RUN npm ci
RUN npx nest build graphql-maingraph

FROM build as deps
COPY --from=build /usr/src/app/dist/apps/graphql-maingraph .
COPY proto ./proto
RUN npm i --omit=dev

CMD ["node", "main"]