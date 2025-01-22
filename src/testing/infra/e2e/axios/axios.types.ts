// File: axios.types.ts

import { BaseOptions } from "@src/common"
import { ApiVersion } from "../../infra.types"

export interface E2EAxiosOptions extends BaseOptions {
    // url for axios instance
    version?: ApiVersion
    // type, to specify how to get the jwt token
    type?: JwtOptionsType
    // acess token, either file path or cache key
    accessToken?: string
    // refresh token options
    refresh?: {
        enabled: boolean
        //refresh token url
        endpoint?: string
        //refresh token, either file path or cache key
        token?: string
    }
    // retries for axios instance
    retries?: number
    // retryDelay for axios instance
    retryDelay?: number
}

export enum JwtOptionsType {
    File = "file",
    Cache = "cache"
}

export enum AxiosType {
    // axios instance without authentication
    NoAuth = "no-auth",
    // axios instance with authentication jwt
    Auth = "auth",
}