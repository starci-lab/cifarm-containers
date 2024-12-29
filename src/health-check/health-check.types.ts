export enum HealthCheckDependency {
    GameplayPostgreSql = "gameplay-postgres",
    CacheRedis = "cache-redis",
    AdapterRedis = "adapter-redis",
    JobRedis = "job-redis",
    Kafka = "kafka",
    GameplayService = "gameplay-service",
    GameplaySubgraph = "gameplay-subgraph",
}