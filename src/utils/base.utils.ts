import { NodeEnv, envConfig } from "@src/config"
import { join } from "path"
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
    return !!envConfig().kubernetes.generated.serviceHost
}

export const waitFor = (observeVariable: boolean, delay: number = 100): Promise<void> => {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (observeVariable) {
                clearInterval(interval)
                resolve()
            }
        }, delay)
    })
}

export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getLoopbackAddress = (port: number = 80) => {
    return `0.0.0.0:${port}`
}

export const getHttpAddress = (host: string, port: number, path?: string) => {
    return path ? `http://${host}:${port}/${path}` : `http://${host}:${port}`
}