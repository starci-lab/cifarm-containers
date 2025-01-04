#!/bin/bash

echo "Starting Docker build"

docker build -t cifarm/cli -f ./apps/cli/Dockerfile . & docker push cifarm/cli
docker build -t cifarm/cron-scheduler -f ./apps/cron-scheduler/Dockerfile . & docker push cifarm/cron-scheduler
docker build -t cifarm/cron-worker -f ./apps/cron-worker/Dockerfile . & docker push cifarm/cron-worker
docker build -t cifarm/gameplay-service -f ./apps/gameplay-service/Dockerfile . & docker push cifarm/gameplay-service
docker build -t cifarm/gameplay-subgraph -f ./apps/gameplay-subgraph/Dockerfile . & docker push cifarm/gameplay-subgraph
docker build -t cifarm/graphql-gateway -f ./apps/graphql-gateway/Dockerfile . & docker push cifarm/graphql-gateway
docker build -t cifarm/rest-api-gateway -f ./apps/rest-api-gateway/Dockerfile . & docker push cifarm/rest-api-gateway
docker build -t cifarm/telegram-bot -f ./apps/telegram-bot/Dockerfile . & docker push cifarm/telegram-bot
docker build -t cifarm/websocket-node -f ./apps/websocket-node/Dockerfile . & docker push cifarm/websocket-node

echo "Docker build completed."
