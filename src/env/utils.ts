import { NestFactory } from "@nestjs/core"
import { envConfig } from "./env.config"
import { NodeEnv, RedisType } from "./types"
import { ConfigOnlyModule } from "./config-only.module"

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

export const loadEnv = async (): Promise<void> => {
    const app = await NestFactory.createApplicationContext(ConfigOnlyModule)
    await app.close()
}

export const e2eEnabled = (): boolean => {
    return envConfig().e2eEnabled
}