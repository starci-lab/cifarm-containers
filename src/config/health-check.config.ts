export const healthCheckConfig = {
    names: {
        gameplayPostgresql: "gameplay-postgres",
        cacheRedis: "cache-redis",
        adapterRedis: "adapter-redis",
        jobRedis: "job-redis",
        kafka: "kafka",
        gameplayService: "gameplay-service",
        gameplaySubgraph: "gameplay-subgraph",
    },
    endpoint: "healthz",
}