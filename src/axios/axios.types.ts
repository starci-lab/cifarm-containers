// File: axios.types.ts

import { AxiosRequestConfig } from "axios"
import { IAxiosRetryConfig } from "axios-retry"
import { AxiosType } from "./axios.constants"

export interface AxiosOptions {
    type?: AxiosType
}

export enum ApiVersion {
    V1 = "v1",
    V2 = "v2"
}

export type AxiosInstanceConfig = AxiosRequestConfig & IAxiosRetryConfig
