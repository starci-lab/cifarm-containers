import { envConfig, NodeEnv } from "./env.config"
import { RedisType } from "./env.types"

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

export const redisClusterEnabled = (type: RedisType = RedisType.Cache): boolean => {
    return envConfig().databases.redis[type].cluster.enabled
}

export const redisClusterRunInDocker = (type: RedisType = RedisType.Cache): boolean => {
    return envConfig().databases.redis[type].cluster.runInDocker
}