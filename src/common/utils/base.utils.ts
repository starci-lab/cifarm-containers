import { Types } from "mongoose"
import { v4 } from "uuid"

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

export const getHttpUrl = ({
    host = "localhost",
    port,
    path,
    useSsl = false
}: GetHttpUrlParams) => {
    const prefix = useSsl ? "https://" : "http://"
    // Ensure path starts without a leading slash if it's provided
    const formattedPath = path?.startsWith("/") ? path.slice(1) : path

    // Building the URL
    const hostPort = port ? `${host}:${port}` : host
    const urlPath = formattedPath ? `/${formattedPath}` : ""

    return `${prefix}${hostPort}${urlPath}`
}

export interface GetHttpUrlParams {
    useSsl?: boolean
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
    const { retries = 10, interval = 5000 } = options
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

export const getWsUrl = ({ host = "localhost", port, useSsl }: GetWsUrlParams) => {
    const prefix = useSsl ? "wss://" : "ws://"
    // Building the URL
    const hostPort = port ? `${host}:${port}` : host
    return `${prefix}${hostPort}`
}

export interface GetWsUrlParams {
    host?: string
    port?: number
    useSsl?: boolean
}

export const getDifferenceAndValues = <TObject extends object>(obj1: TObject, obj2: TObject): TObject => {
    const diff = {} as TObject
    // Loop through keys in the second object
    for (const key in obj2) {
        // Check if the key exists in both objects
        if (Object.prototype.hasOwnProperty.call(obj1, key)) {
            if (typeof obj2[key] === "object" && obj2[key] !== null && typeof obj1[key] === "object" && obj1[key] !== null) {
                // If both values are objects, recurse to compare their properties
                const nestedDiff = getDifferenceAndValues(obj1[key], obj2[key])
                if (Object.keys(nestedDiff).length > 0) {
                    // Only add to diff if there are differences in the nested object
                    diff[key] = nestedDiff
                }
            } else if (obj1[key] !== obj2[key]) {
                // If the values are different, store the value from obj2
                diff[key] = obj2[key]
            }
        } else {
            // If the key doesn't exist in obj1, it's a new key in obj2
            diff[key] = obj2[key]
        }
    }

    return diff
}

export const createObjectId = (id: string = v4()): Types.ObjectId => {
    let hex = Buffer.from(id, "utf-8").toString("hex")
    if (hex.length < 24) {
        hex = hex.padStart(24, "0")
    } else if (hex.length > 24) {
        hex = hex.slice(0, 24)
    }
    return new Types.ObjectId(hex)
}