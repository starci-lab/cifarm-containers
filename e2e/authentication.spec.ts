// npx jest --config ./e2e/jest.json ./e2e/authentication.spec.ts

import {
    RequestMessageResponse,
    GenerateSignatureResponse,
    GenerateSignatureRequest
} from "@apps/gameplay-service"
import { HttpStatus } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { IBlockchainAuthService, getBlockchainAuthServiceToken, Platform } from "@src/blockchain"
import { ChainKey, Network } from "@src/env"
import {
    E2EConnectionService,
    TestingInfraModule,
    TestContext,
    E2EAxiosService
} from "@src/testing"
import { AxiosResponse } from "axios"
import { isJWT, IsJWT, isUUID, IsUUID } from "class-validator"
import { v4 } from "uuid"

describe("Authentication Flow", () => {
    let e2eAxiosService: E2EAxiosService
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
        e2eAxiosService = moduleRef.get(E2EAxiosService)
        e2eConnectionService = moduleRef.get(E2EConnectionService)
        solanaAuthService = moduleRef.get(getBlockchainAuthServiceToken(Platform.Solana))
    })

    it("should authenticate Solana user successfully via signed message", async () => {
        const chainKey = ChainKey.Solana
        const name = v4()
        const { noAuthAxios } = e2eAxiosService.create(name)
        const requestMessageResponse =
            await noAuthAxios.post<RequestMessageResponse>("gameplay/request-message")
        // Assert: Check that the response status is 200
        expect(requestMessageResponse.status).toBe(HttpStatus.OK)
        const { privateKey, publicKey } = solanaAuthService.getKeyPair(1)
        const signature = solanaAuthService.signMessage({
            message: requestMessageResponse.data.message,
            privateKey
        })
        const verifySignatureResponse = await noAuthAxios.post("gameplay/verify-signature", {
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

    it("should authenticate Solana user successfully with signature generation for new account", async () => {
        const chainKey = ChainKey.Solana
        const name = v4()
        const { noAuthAxios } = e2eAxiosService.create(name)
        const generateSignatureResponse = await noAuthAxios.post<
            GenerateSignatureResponse,
            AxiosResponse<GenerateSignatureResponse, GenerateSignatureRequest>,
            GenerateSignatureRequest
        >("gameplay/generate-signature", {
            accountNumber: 3,
            chainKey,
            network: Network.Testnet
        })

        // Assert: Check that the response status is 200
        expect(generateSignatureResponse.status).toBe(HttpStatus.OK)
        const verifySignatureResponse = await noAuthAxios.post(
            "gameplay/verify-signature",
            generateSignatureResponse.data
        )
        // Assert: Check that the response status is 200
        expect(verifySignatureResponse.status).toBe(HttpStatus.OK)
        // Assert: Check that the response data contains the access token
        expect(IsJWT(verifySignatureResponse.data.accessToken)).toBeTruthy()
        // Assert: Check that the response data contains the refresh token
        expect(IsUUID(verifySignatureResponse.data.refreshToken)).toBeTruthy()
    })

    it("sould refresh token retrieved access token", async () => {
        const chainKey = ChainKey.Solana
        const name = v4()
        const { noAuthAxios } = e2eAxiosService.create(name)
        const requestMessageResponse =
            await noAuthAxios.post<RequestMessageResponse>("gameplay/request-message")
        // Assert: Check that the response status is 200
        expect(requestMessageResponse.status).toBe(HttpStatus.OK)
        const { privateKey, publicKey } = solanaAuthService.getKeyPair(1)
        const signature = solanaAuthService.signMessage({
            message: requestMessageResponse.data.message,
            privateKey
        })
        const verifySignatureResponse = await noAuthAxios.post("gameplay/verify-signature", {
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
        expect(isJWT(verifySignatureResponse.data.accessToken)).toBeTruthy()
        // Assert: Check that the response data contains the refresh token
        expect(isUUID(verifySignatureResponse.data.refreshToken)).toBeTruthy()

        const refreshToken = verifySignatureResponse.data.refreshToken
        const refreshResponse = await noAuthAxios.post("gameplay/refresh", {
            refreshToken
        })
        // Assert: Check that the response status is 200
        expect(refreshResponse.status).toBe(HttpStatus.OK)
        // Assert: Check that the response data contains the access token
        expect(isJWT(refreshResponse.data.accessToken)).toBeTruthy()
        // Assert: Check that the response data contains the refresh token
        expect(isUUID(refreshResponse.data.refreshToken)).toBeTruthy()
    })

    afterAll(async () => {
        await e2eConnectionService.closeAll()
    })
})
