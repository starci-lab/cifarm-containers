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