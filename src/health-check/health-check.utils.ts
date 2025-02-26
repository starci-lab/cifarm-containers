import { MongoDatabase, MongooseDatabase, RedisType } from "@src/env"
import { JOB_REDIS, CACHE_REDIS, ADAPTER_REDIS, ADAPTER_MONGODB } from "./health-check.constants"
import { HealthCheckDependency, DependencyData } from "./health-check.types"
import { getMongooseToken } from "@src/databases"

export const redisMap = (): Record<RedisType, DependencyData> => ({
    [RedisType.Job]: {
        dependency: HealthCheckDependency.JobRedis,
        token: JOB_REDIS
    },
    [RedisType.Cache]: {
        dependency: HealthCheckDependency.CacheRedis,
        token: CACHE_REDIS
    },
    [RedisType.Adapter]: {
        dependency: HealthCheckDependency.AdapterRedis,
        token: ADAPTER_REDIS
    }
})

export const mongoDbMap = (): Partial<Record<MongoDatabase, DependencyData>> => ({
    [MongoDatabase.Adapter]: {
        dependency: HealthCheckDependency.AdapterMongoDb,
        token: ADAPTER_MONGODB
    }
})

export const mongooseMap = (): Partial<Record<MongooseDatabase, DependencyData>> => ({
    [MongooseDatabase.Gameplay]: {
        dependency: HealthCheckDependency.GameplayMoongoose,
        token: getMongooseToken({
            database: MongooseDatabase.Gameplay
        })
    }
})