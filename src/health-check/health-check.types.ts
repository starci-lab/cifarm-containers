export enum HealthCheckDependency {
    GameplayMongoDb = "gameplay-mongodb",
    CacheRedis = "cache-redis",
    AdapterRedis = "adapter-redis",
    JobRedis = "job-redis",
    Kafka = "kafka",
    GameplaySubgraph = "gameplay-subgraph",
    GraphQLGateway = "graphql-gateway",
    IO = "io",
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