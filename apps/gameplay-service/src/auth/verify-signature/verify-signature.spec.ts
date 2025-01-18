// npx jest apps/gameplay-service/src/auth/verify-signature/verify-signature.spec.ts

import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Test } from "@nestjs/testing"
import { isJWT, isUUID } from "class-validator"
import { getPostgreSqlToken, PlacedItemType, UserEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { VerifySignatureService } from "./verify-signature.service"
import { RequestMessageService } from "../request-message"
import { GenerateSignatureService } from "../generate-signature"
import { SolanaAuthService } from "@src/blockchain"
import { encode } from "bs58"
import { Network, SupportedChainKey } from "@src/env"

describe("VerifySignatureService", () => {
    let service: VerifySignatureService
    let requestMessageService: RequestMessageService
    let generateSignatureService: GenerateSignatureService
    let solanaAuthService: SolanaAuthService
    let gameplayMockUserService: GameplayMockUserService
    let dataSource: DataSource
    let connectionService: ConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [RequestMessageService, GenerateSignatureService, VerifySignatureService]
        }).compile()

        // services
        service = moduleRef.get(VerifySignatureService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        dataSource = moduleRef.get(getPostgreSqlToken())

        requestMessageService = moduleRef.get<RequestMessageService>(RequestMessageService)
        generateSignatureService = moduleRef.get(GenerateSignatureService)
        solanaAuthService = moduleRef.get(SolanaAuthService)
        connectionService = moduleRef.get(ConnectionService)
    })

    const verifyAndValidateUserTokens = async ({
        message,
        publicKey,
        signature,
        chainKey,
        network,
        accountAddress
    }: VerifyAndValidateUserTokensParams) => {
        const { accessToken, refreshToken } = await service.verifySignature({
            message,
            publicKey,
            signature,
            accountAddress,
            chainKey,
            network,
            deviceInfo: {
                device: "device",
                os: "os",
                browser: "browser",
                ipV4: ""
            }
        })
    
        // Assertions
        expect(isJWT(accessToken)).toBe(true)
        expect(isUUID(refreshToken)).toBe(true)
    
        // Check user existence and validate items
        const user = await dataSource.manager.findOne(UserEntity, {
            where: { accountAddress: publicKey },
            relations: {
                placedItems: {
                    placedItemType: true
                }
            }
        })
    
        expect(user).toBeTruthy()
    
        // Check if user has the correct number of items
        expect(user.placedItems.length).toBe(7)
    
        const home = user.placedItems.find(
            (item) => item.placedItemType.type === PlacedItemType.Building
        )
        expect(home).toBeTruthy()
    
        const tiles = user.placedItems.filter(
            (item) => item.placedItemType.type === PlacedItemType.Tile
        )
        expect(tiles.length).toBe(6)
    }
    
    it("should use actual flow", async () => {
        const { message } = await requestMessageService.requestMessage()
        const { publicKey: _publicKey, secretKey: _secretKey } = solanaAuthService.getFakeKeyPair(0)

        const publicKey = _publicKey.toBase58()
        const signature = solanaAuthService.signMessage(message, encode(_secretKey))

        await verifyAndValidateUserTokens({
            message,
            publicKey,
            signature,
            chainKey: SupportedChainKey.Solana,
            network: Network.Testnet,
            accountAddress: publicKey
        })
    })

    it("should use generated flow", async () => {
        const { message, publicKey, signature, accountAddress, chainKey, network } =
            await generateSignatureService.generateSignature({
                accountNumber: 0,
                chainKey: SupportedChainKey.Solana,
                network: Network.Testnet
            })

        await verifyAndValidateUserTokens({
            message,
            publicKey,
            signature,
            chainKey,
            network,
            accountAddress
        })
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
        console.log(dataSource.isInitialized)
    })
})

interface VerifyAndValidateUserTokensParams {
    message: string
    publicKey: string
    signature: string
    chainKey: SupportedChainKey
    network: Network
    accountAddress: string
}
