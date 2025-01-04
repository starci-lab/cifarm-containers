import { envConfig, NodeEnv } from "./env.config"

//sw2s
export const getEnvValue = <ValueType = string>(values: {
    development?: ValueType
    production?: ValueType
}): ValueType => {
    const { development, production } = values
    switch (envConfig().nodeEnv) {
    case NodeEnv.Production:
        return production
    default:
        return development
    }
}

export const isProduction = (): boolean => {
    return envConfig().nodeEnv === NodeEnv.Production
}

export const runInKubernetes = (): boolean => {
    return !!envConfig().kubernetes.serviceHost
}

export const enum RedisClusterType {
    Cache = "cache",
    Job = "job",
    Adaptper = "adapter",
}

export const isRedisClusterEnabled = (type: RedisClusterType = RedisClusterType.Cache): boolean => {
    switch (type) {
    case RedisClusterType.Cache:
        return envConfig().databases.redis.cache.cluster.enabled
    case RedisClusterType.Job:
        return envConfig().databases.redis.job.cluster.enabled
    case RedisClusterType.Adaptper:
        return envConfig().databases.redis.adapter.cluster.enabled
    }
}