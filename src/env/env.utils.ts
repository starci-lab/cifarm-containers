import { envConfig } from "./env.config"
import { NodeEnv, RedisType } from "./env.types"

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