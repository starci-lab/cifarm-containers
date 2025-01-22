// File: axios.types.ts

import { BaseOptions } from "@src/common"
import { ApiVersion } from "../../infra.types"
import { AxiosInstance } from "axios"

export interface E2EAxiosOptions extends BaseOptions {
    // url for axios instance
    version?: ApiVersion
    // refresh token options
    refreshEndpoint?: string
    // retries for axios instance
    retries?: number
    // retryDelay for axios instance
    retryDelay?: number
}

export enum AxiosType {
    // axios instance without authentication
    NoAuth = "no-auth",
    // axios instance with authentication jwt
    Auth = "auth",
}

export interface AxiosData {
    // authenticated axios instance
    authAxios: AxiosInstance
    // no authenticated axios instance
    noAuthAxios: AxiosInstance
}