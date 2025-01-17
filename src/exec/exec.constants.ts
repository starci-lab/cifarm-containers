import { Container } from "@src/env"
import { ContainerInfo } from "./exec.types"

export const containerMap : Record<Container, ContainerInfo> = {
    [Container.GameplaySubgraph]: {
        image: "cifarm/gameplay-subgraph",
        dockerfile: "./apps/gameplay-subgraph/Dockerfile"
    },
    [Container.CronScheduler]: {
        image: "cifarm/cron-scheduler",
        dockerfile: "./apps/cron-scheduler/Dockerfile"
    },
    [Container.CronWorker]: {
        image: "cifarm/cron-worker",
        dockerfile: "./apps/cron-worker/Dockerfile"
    },
    [Container.GameplayService]: {
        image: "cifarm/gameplay-service",
        dockerfile: "./apps/gameplay-service/Dockerfile"
    },
    [Container.GraphQLGateway]: {
        image: "cifarm/graphql-gateway",
        dockerfile: "./apps/graphql-gateway/Dockerfile"
    },
    [Container.IoGameplay]: {
        image: "cifarm/io-gameplay",
        dockerfile: "./apps/io-gameplay/Dockerfile"
    },
    [Container.RestApiGateway]: {
        image: "cifarm/rest-api-gateway",
        dockerfile: "./apps/rest-api-gateway/Dockerfile"
    },
    [Container.Cli]: {
        image: "cifarm/cli",
        dockerfile: "./apps/cli/Dockerfile"
    },
    [Container.TelegramBot]: {
        image: "cifarm/telegram-bot",
        dockerfile: "./apps/telegram-bot/Dockerfile"
    }     
}