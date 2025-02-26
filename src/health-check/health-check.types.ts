export enum HealthCheckDependency {
    GameplayMoongoose = "gameplay-mongoose",
    CacheRedis = "cache-redis",
    AdapterRedis = "adapter-redis",
    JobRedis = "job-redis",
    Kafka = "kafka",
    GameplayService = "gameplay-service",
    GameplaySubgraph = "gameplay-subgraph",
    GraphQLGateway = "graphql-gateway",
    RestApiGateway = "rest-api-gateway",
    IoGameplay = "io-gameplay",
    CronScheduler = "cron-scheduler",
    CronWorker = "cron-worker",
    AdapterMongoDb = "adapter-mongodb",
}

export interface HealthCheckOptions {
    dependencies: Array<HealthCheckDependency>
}

export interface DependencyData {
    dependency: HealthCheckDependency
    token: string
}