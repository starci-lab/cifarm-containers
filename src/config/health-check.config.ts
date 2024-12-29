export const healthCheckConfig = {
    names: {
        gameplayPostgreSql: "gameplay-postgres",
        cacheRedis: "cache-redis",
        adapterRedis: "adapter-redis",
        jobRedis: "job-redis",
        kafka: "kafka",
        gameplayService: "gameplay-service",
        gameplaySubgraph: "gameplay-subgraph",
    },
    endpoint: "healthz",
}