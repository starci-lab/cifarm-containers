import { ApiVersion, AxiosInstanceConfig } from "./axios.types"

export const DEFAULT_BASE_URL = "http://localhost:3001"
export const AXIOS_INSTANCE_TOKEN = "AXIOS_INSTANCE_TOKEN"

export type AxiosValues = {
    version: ApiVersion,
    injectionToken?: string,
    config?: AxiosInstanceConfig
}

export const enum AxiosType {
    Auth = "Auth",
    NoAuth = "NoAuth"
}

export const axiosMap: Record<AxiosType, AxiosValues> = {
    [AxiosType.Auth]: {
        version: ApiVersion.V1,
        config: {
            baseURL: DEFAULT_BASE_URL,
            "axios-retry": {
                retries: 3
            },
        },
    },
    [AxiosType.NoAuth]: {
        version: ApiVersion.V1,
        config: {
            baseURL: DEFAULT_BASE_URL,
        }
    }
}