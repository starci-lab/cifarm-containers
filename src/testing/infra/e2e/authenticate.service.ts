import {
    GenerateSignatureRequest,
    GenerateSignatureResponse,
    VerifySignatureResponse
} from "@apps/gameplay-service"
import { Injectable } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { Network, ChainKey } from "@src/env"
import { ACCESS_TOKEN, AxiosType, InjectAxios, REFRESH_TOKEN } from "./axios"
import { AxiosInstance, AxiosResponse } from "axios"
import { Cache } from "cache-manager"
import { JwtService, UserLike } from "@src/jwt"

@Injectable()
export class E2EAuthenticateService {
    constructor(
        @InjectAxios(AxiosType.NoAuth)
        private readonly axios: AxiosInstance,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly jwtService: JwtService
    ) {}

    async authenticate({
        accountNumber = 0,
        chainKey = ChainKey.Solana,
        network = Network.Testnet
    }: AuthenticateParams): Promise<UserLike> {
        const generateSignatureResponse = await this.axios.post<
            GenerateSignatureResponse,
            AxiosResponse<GenerateSignatureResponse, GenerateSignatureRequest>,
            GenerateSignatureRequest
        >("generate-signature", {
            accountNumber,
            chainKey,
            network
        })
        const verifySignatureResponse = await this.axios.post<
            VerifySignatureResponse,
            AxiosResponse<VerifySignatureResponse, GenerateSignatureRequest>,
            GenerateSignatureRequest
        >("verify-signature", generateSignatureResponse.data)
        //store access, refresh token in cache
        await this.cacheManager.set(ACCESS_TOKEN, verifySignatureResponse.data.accessToken, 0)
        await this.cacheManager.set(REFRESH_TOKEN, verifySignatureResponse.data.refreshToken, 0)
        return await this.jwtService.decodeToken(verifySignatureResponse.data.accessToken)
    }
}

export interface AuthenticateParams {
    accountNumber?: number
    chainKey?: ChainKey
    network?: Network
}
