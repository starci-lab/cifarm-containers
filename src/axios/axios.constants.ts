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
    AxiosWithAuth = "AxiosWithAuth",
    AxiosWithNoAuth = "AxiosWithNoAuth"
}

export const axiosConfigs: Record<AxiosType, AxiosValues> = {
    [AxiosType.AxiosWithAuth]: {
        baseUrl: DEFAULT_BASE_URL,
        version: ApiVersion.V1,
        injectionToken: `${AxiosType.AxiosWithAuth}_TOKEN`,
        config: {
            "axios-retry": {
                retries: 3
            }
        },
        
    },
    [AxiosType.AxiosWithNoAuth]: {
        baseUrl: DEFAULT_BASE_URL,
        version: ApiVersion.V1,
        injectionToken: `${AxiosType.AxiosWithNoAuth}_TOKEN`
    }
}