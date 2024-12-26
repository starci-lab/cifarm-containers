export const healthcheckConfig = {
    names: {
        gameplayPostgresql: "gameplay-postgres",
        cacheRedis: "cache-redis",
        kafka: "kafka",
        gameplayService: "gameplay-service",
    },
    endpoint: "healthz",
}