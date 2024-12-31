export enum HealthCheckDependency {
    GameplayPostgreSql = "gameplay-postgres",
    TelegramUserTrackerPostgreSQL = "telegram-user-tracker-postgres",
    CacheRedis = "cache-redis",
    AdapterRedis = "adapter-redis",
    JobRedis = "job-redis",
    Kafka = "kafka",
    GameplayService = "gameplay-service",
    GameplaySubgraph = "gameplay-subgraph",
}