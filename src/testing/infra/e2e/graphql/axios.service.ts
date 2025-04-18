import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common"
import axios, { AxiosError, AxiosInstance } from "axios"
import { MODULE_OPTIONS_TOKEN } from "./axios.module-definition"
import { AxiosData, E2EAxiosOptions } from "./axios.types"
import { InjectCache } from "@src/cache"
import { ApiVersion } from "../../infra.types"
import { restApiUrlMap } from "./axios.constants"
import { AuthCredentialType } from "@src/jwt"
import { Cache } from "cache-manager"
import axiosRetry from "axios-retry"

@Injectable()
export class E2EAxiosService {
    private readonly logger = new Logger(E2EAxiosService.name)
    public readonly axiosMap: Record<string, AxiosData>
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: E2EAxiosOptions,
        @InjectCache()
        private readonly cacheManager: Cache
    ) {
        this.axiosMap = {}
    }

    public getCacheKey({ name, type = AuthCredentialType.AccessToken }: GetCacheKeyParams): string {
        return `${name}${type}`
    }

    async getToken({
        name,
        type = AuthCredentialType.AccessToken
    }: GetTokenParams): Promise<string> {
        return this.cacheManager.get(this.getCacheKey({ name, type }))
    }

    private createAxiosInstance({
        name,
        version,
        withAuth = false
    }: CreateAxiosInstanceParams): AxiosInstance {
        const axiosInstance = axios.create({
            baseURL: restApiUrlMap[version]
        })

        if (withAuth) {
            // Add interceptors for authorization
            axiosInstance.interceptors.request.use(
                async (config) => {
                    // Add the access token to the Authorization header if it exists
                    const accessToken = await this.getToken({ name })
                    if (accessToken) {
                        config.headers["Authorization"] = `Bearer ${accessToken}`
                    }
                    return config
                },
                async (error) => {
                    throw error
                }
            )

            axiosInstance.interceptors.response.use(
                (response) => response, // Pass through the successful response
                async (error: AxiosError) => {
                    if (error.response?.status === HttpStatus.UNAUTHORIZED) {
                        // Attempt to refresh the token on 401 Unauthorized
                        const refreshToken = await this.getToken({ name, type: AuthCredentialType.RefreshToken })
                        if (refreshToken) {
                            const endpoint = this.options.refreshEndpoint || "refresh"
                            const refreshResponse = await axiosInstance.post(endpoint, {
                                refreshToken
                            })

                            // Update the JWT tokens in the cache
                            await this.cacheManager.set(
                                this.getCacheKey({ name }),
                                refreshResponse.data.accessToken,
                                0
                            )
                            await this.cacheManager.set(
                                this.getCacheKey({
                                    name,
                                    type: AuthCredentialType.RefreshToken
                                }),
                                refreshResponse.data.refreshToken,
                                0
                            )

                            // Retry the original request with the new access token
                            return axiosInstance(error.config)
                        }
                    }

                    // If it's not a 401 or another retryable error, reject the promise
                    this.logger.error(error)
                    throw error
                }
            )
        }

        // Apply retry logic for all axios instances
        axiosRetry(axiosInstance, {
            retries: this.options.retries,
            retryDelay: (retryCount) => retryCount * this.options.retryDelay || 2000
        })

        return axiosInstance
    }

    public create(name: string): AxiosData {
        const version = this.options.version || ApiVersion.V1
        const data: AxiosData = {
            noAuthAxios: this.createAxiosInstance({
                name,
                version
            }), // No Auth: Create axios instance without auth
            authAxios: this.createAxiosInstance({
                name,
                version,
                withAuth: true
            }) // Auth: Create axios instance with auth
        }
        this.axiosMap[name] = data
        return data
    }
}

export interface GetCacheKeyParams {
    name: string
    type?: AuthCredentialType
}

export type GetTokenParams = GetCacheKeyParams

export interface CreateAxiosInstanceParams {
    name: string
    version: ApiVersion
    withAuth?: boolean
}
