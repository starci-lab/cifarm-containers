import { NodeEnv, envConfig } from "@src/grpc"

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

export const getHttpUrl = (params: GetHttpUrlParams) => {
    const host = params.host || "localhost"
    const port = params.port
    const path = params.path

    const prefix = "http://"

    if (path) {
        if (port) {
            return `${prefix}${host}:${port}/${path}`
        }
        return `${prefix}${host}/${path}`
    }
    if (port) {
        return `${prefix}${host}:${port}`
    }
    return `${prefix}${host}`
}

export interface GetHttpUrlParams {
    host?: string
    port?: number
    path?: string
}