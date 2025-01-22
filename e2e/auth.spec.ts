//npx jest --config ./e2e/jest.json ./e2e/auth.spec.ts

import { RequestMessageResponse } from "@apps/gameplay-service"
import { HttpStatus } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { getBlockchainAuthServiceToken, IBlockchainAuthService, Platform } from "@src/blockchain"
import { ChainKey, Network } from "@src/env"
import { TestingInfraModule, AxiosType, getAxiosToken, TestContext, E2EConnectionService } from "@src/testing"
import { AxiosInstance } from "axios"
import { IsJWT, IsUUID } from "class-validator"

describe("authentication flow", () => {
    let noAuthAxios: AxiosInstance
    let e2eConnectionService: E2EConnectionService
    let solanaAuthService: IBlockchainAuthService
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register({
                    context: TestContext.E2E
                })
            ],
            providers: []
        }).compile()
        noAuthAxios = moduleRef.get(getAxiosToken(AxiosType.NoAuth))
        e2eConnectionService = moduleRef.get(E2EConnectionService)
        solanaAuthService = moduleRef.get(getBlockchainAuthServiceToken(Platform.Solana))
    })

    it("should authenticate successfully in Solana via message", async () => {
        const chainKey = ChainKey.Solana

        const requestMessageResponse = await noAuthAxios.post<RequestMessageResponse>("request-message")
        // Assert: Check that the response status is 200
        expect(requestMessageResponse.status).toBe(HttpStatus.OK)
        const { privateKey, publicKey } = solanaAuthService.getKeyPair(1)
        const signature = solanaAuthService.signMessage({
            message: requestMessageResponse.data.message,
            privateKey
        })
        const verifySignatureResponse = await noAuthAxios.post("verify-signature", {
            message: requestMessageResponse.data.message,
            publicKey,
            signature,
            chainKey,
            network: Network.Testnet,
            accountAddress: publicKey
        })
        // Assert: Check that the response status is 200
        expect(verifySignatureResponse.status).toBe(HttpStatus.OK)
        // Assert: Check that the response data contains the access token
        expect(IsJWT(verifySignatureResponse.data.accessToken)).toBeTruthy()
        // Assert: Check that the response data contains the refresh token
        expect(IsUUID(verifySignatureResponse.data.refreshToken)).toBeTruthy()
    })

    afterAll(async () => {
        await e2eConnectionService.closeAll()
    })
})
