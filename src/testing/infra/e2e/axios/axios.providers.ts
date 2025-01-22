import { HttpStatus, Provider } from "@nestjs/common"
import Axios, { AxiosError, AxiosInstance } from "axios"
import axiosRetry from "axios-retry"
import { MODULE_OPTIONS_TOKEN } from "./axios.module-definition"
import { AxiosType, E2EAxiosOptions, JwtOptionsType } from "./axios.types"
import { readFileSync } from "fs"
import { ACCESS_TOKEN, REFRESH_TOKEN, urlMap } from "./axios.constants"
import { ApiVersion } from "../../infra.types"
import { CACHE_MANAGER } from "@src/cache"
import { Cache } from "cache-manager"
import { getAxiosToken } from "./axios.utils"

export const createE2EAxiosFactoryProvider = (axiosType = AxiosType.NoAuth): Provider => ({
    provide: getAxiosToken(axiosType),
    inject: [MODULE_OPTIONS_TOKEN, CACHE_MANAGER],
    useFactory: async (options: E2EAxiosOptions, cacheManager: Cache): Promise<AxiosInstance> => {
        const version = options.version || ApiVersion.V1
        // create axios instance

        const axiosInstance = Axios.create({
            baseURL: urlMap[version]
        })

        if (axiosType === AxiosType.Auth) {
            const accessToken = options.accessToken || ACCESS_TOKEN
            const refreshToken = options.refresh?.token || REFRESH_TOKEN

            let accessTokenValue: string
            let refreshTokenValue: string

            accessTokenValue =
                options.type === JwtOptionsType.File
                    ? readFileSync(accessToken, "utf-8")
                    : await cacheManager.get(accessToken)
            axiosInstance.interceptors.request.use(
                (config) => {
                    // Add the access token to the Authorization header if it exists
                    if (accessTokenValue) {
                        config.headers["Authorization"] = `Bearer ${accessTokenValue}`
                    }
                    return config
                },
                (error) => {
                    return Promise.reject(error)
                }
            )

            if (options.refresh?.enabled) {
                refreshTokenValue =
                    options.type === JwtOptionsType.File
                        ? readFileSync(refreshToken, "utf-8")
                        : await cacheManager.get(refreshToken)
                axiosInstance.interceptors.response.use(
                    (response) => response, // Pass through the successful response
                    async (error: AxiosError) => {
                        // Check for 401 Unauthorized error (JWT expired or invalid)
                        if (error.response?.status === HttpStatus.UNAUTHORIZED) {
                            try {
                                // Refresh the JWT token
                                const endpoint =
                                    options.refresh.endpoint || "refresh"
                                const response = await axiosInstance.post(
                                    endpoint,
                                    {
                                        refreshToken: refreshTokenValue
                                    }
                                )
                                // Update the JWT token
                                accessTokenValue = response.data.accessToken
                                // Retry the original request
                                return axiosInstance(error.config)
                            } catch (refreshError) {
                                // If the refresh token fails, handle the error appropriately
                                return Promise.reject(refreshError)
                            }
                        }

                        // If it's not a 401 or another retryable error, reject the promise
                        return Promise.reject(error)
                    }
                )
            }
        }

        axiosRetry(axiosInstance, {
            retries: options.retries,
            retryDelay: (retryCount) => retryCount * options.retryDelay || 2000
        })
        return axiosInstance
    }
})
