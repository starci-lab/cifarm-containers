import { ApiVersion, AxiosInstanceConfig } from "./axios.types"

export const DEFAULT_BASE_URL = "http://localhost:3001"
export const AXIOS_INSTANCE_TOKEN = "AXIOS_INSTANCE_TOKEN"

export type AxiosValues = {
    baseUrl: string,
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
        baseUrl: DEFAULT_BASE_URL,
        version: ApiVersion.V1,
        injectionToken: `${AxiosType.Auth}_TOKEN`,
        config: {
            "axios-retry": {
                retries: 3
            }
        },
    },
    [AxiosType.NoAuth]: {
        baseUrl: DEFAULT_BASE_URL,
        version: ApiVersion.V1,
        injectionToken: `${AxiosType.NoAuth}_TOKEN`
    }
}