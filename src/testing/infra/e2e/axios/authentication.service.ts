import {
    GenerateSignatureRequest,
    GenerateSignatureResponse,
    VerifySignatureResponse
} from "@apps/gameplay-service"
import { Injectable } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { ChainKey, Network } from "@src/env"
import { AxiosType } from "./axios.types"
import { AxiosResponse } from "axios"
import { Cache } from "cache-manager"
import { AuthCredentialType, JwtService, UserLike } from "@src/jwt"
import { E2EAxiosService } from "./axios.service"
import { DataSource, In } from "typeorm"
import { InjectPostgreSQL, UserEntity } from "@src/databases"

@Injectable()
export class E2ERAuthenticationService {
    private userMap: Record<string, UserLike>
    constructor(
        @InjectCache()
        private readonly cacheManager: Cache,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly axiosService: E2EAxiosService,
        private readonly jwtService: JwtService
    ) {
        this.userMap = {}
    }

    async authenticate({
        name,
        accountNumber = 0,
        chainKey = ChainKey.Solana,
        network = Network.Testnet
    }: AuthenticateParams): Promise<UserLike> {
        const noAuthAxios = this.axiosService.getAxios(name, AxiosType.NoAuth)
        const generateSignatureResponse = await noAuthAxios.post<
            GenerateSignatureResponse,
            AxiosResponse<GenerateSignatureResponse, GenerateSignatureRequest>,
            GenerateSignatureRequest
        >("gameplay/generate-signature", {
            accountNumber,
            chainKey,
            network
        })
        const verifySignatureResponse = await noAuthAxios.post<
            VerifySignatureResponse,
            AxiosResponse<VerifySignatureResponse, GenerateSignatureRequest>,
            GenerateSignatureRequest
        >("gameplay/verify-signature", generateSignatureResponse.data)
        //store access, refresh token in cache
        await this.cacheManager.set(this.axiosService.getCacheKey({
            name
        }), verifySignatureResponse.data.accessToken, 0)
        await this.cacheManager.set(this.axiosService.getCacheKey({
            name,
            type: AuthCredentialType.RefreshToken
        }), verifySignatureResponse.data.refreshToken, 0)
        //decode token and store user
        const user = await this.jwtService.decodeToken(verifySignatureResponse.data.accessToken)
        this.userMap[name] = user
        return user
    }

    async clear(): Promise<void> {
        const promises: Array<Promise<void>> = []
        promises.push((async () => {
            await this.dataSource.manager.delete(UserEntity, {
                id: In(Object.values(this.userMap).map((user) => user.id))
            })
        })())
        promises.push(...Object.keys(this.userMap).map(async (name) => {
            await this.cacheManager.del(this.axiosService.getCacheKey({
                name
            }))
            await this.cacheManager.del(this.axiosService.getCacheKey({
                name,
                type: AuthCredentialType.RefreshToken
            }))
        }), )
        await Promise.all(promises)
    }
}

export interface AuthenticateParams {
    name: string
    accountNumber?: number
    chainKey?: ChainKey
    network?: Network
}
