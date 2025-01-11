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

export interface RetryIfErrorOptions {
    retries?: number
    interval?: number
}

export const retryIfError = async <T>(
    fn: () => Promise<T>,
    options: RetryIfErrorOptions = {}
): Promise<T> => {
    const { retries = 3, interval = 2000 } = options
    let error: Error | null = null
    for (let i = 0; i < retries; i++) {
        try {
            return await fn()
        } catch (ex) {
            console.error(`Error occurred: ${ex.message}, retrying... (${i + 1}/${retries})`)
            error = ex
            await sleep(interval)
        }
    }
    throw error
}
