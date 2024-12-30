import { envConfig, NodeEnv } from "@src/env"

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

export const getHttpUrl = ({ host = "localhost", port, path }: GetHttpUrlParams) => {
    const prefix = "http://"
    
    // Ensure path starts without a leading slash if it's provided
    const formattedPath = path?.startsWith("/") ? path.slice(1) : path

    // Building the URL
    const hostPort = port ? `${host}:${port}` : host
    const urlPath = formattedPath ? `/${formattedPath}` : ""

    return `${prefix}${hostPort}${urlPath}`
}


export interface GetHttpUrlParams {
    host?: string
    port?: number
    path?: string
}