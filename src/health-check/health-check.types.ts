export enum HealthCheckDependency {
    GameplayPostgreSQL = "gameplay-postgres",
    TelegramPostgreSQL = "telegram-postgres",
    CacheRedis = "cache-redis",
    AdapterRedis = "adapter-redis",
    JobRedis = "job-redis",
    Kafka = "kafka",
    GameplayService = "gameplay-service",
    GameplaySubgraph = "gameplay-subgraph",
    GraphQLGateway = "graphql-gateway",
    RestApiGateway = "rest-api-gateway",
    WebsocketNode = "websocket-node",
    CronScheduler = "cron-scheduler",
    CronWorker = "cron-worker",
}

export interface HealthCheckOptions {
    dependencies: Array<HealthCheckDependency>
}