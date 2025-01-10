import { PostgreSQLDatabase, RedisType } from "@src/env"
import { JOB_REDIS, CACHE_REDIS, ADAPTER_REDIS } from "./health-check.constants"
import { HealthCheckDependency, DependencyData } from "./health-check.types"
import { getPostgreSqlToken } from "@src/databases"

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

export const dataSourcesMap = (): Record<PostgreSQLDatabase, DependencyData> => ({
    [PostgreSQLDatabase.Gameplay]: {
        dependency: HealthCheckDependency.GameplayPostgreSQL,
        token: getPostgreSqlToken({
            database: PostgreSQLDatabase.Gameplay
        })
    },
    [PostgreSQLDatabase.Telegram]: {
        dependency: HealthCheckDependency.TelegramPostgreSQL,
        token: getPostgreSqlToken({
            database: PostgreSQLDatabase.Telegram
        })
    }
})
