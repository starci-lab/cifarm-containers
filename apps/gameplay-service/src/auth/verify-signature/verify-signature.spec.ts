// npx jest apps/gameplay-service/src/auth/verify-signature/verify-signature.spec.ts

import { GameplayConnectionService, TestingInfraModule } from "@src/testing"
import { Test } from "@nestjs/testing"
import { isJWT, isUUID } from "class-validator"
import { getMongooseToken, InventorySchema, PlacedItemSchema, PlacedItemTypeKey, UserSchema } from "@src/databases"
import { VerifySignatureService } from "./verify-signature.service"
import { RequestMessageService } from "../request-message"
import { GenerateSignatureService } from "../generate-signature"
import { getBlockchainAuthServiceToken, IBlockchainAuthService, Platform } from "@src/blockchain"
import { Network, ChainKey } from "@src/env"
import { Connection } from "mongoose"

describe("VerifySignatureService", () => {
    let service: VerifySignatureService
    let requestMessageService: RequestMessageService
    let generateSignatureService: GenerateSignatureService
    let blockchainAuthService: IBlockchainAuthService
    let connection: Connection
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [RequestMessageService, GenerateSignatureService, VerifySignatureService]
        }).compile()

        // services
        service = moduleRef.get(VerifySignatureService)
        connection = moduleRef.get(getMongooseToken())

        requestMessageService = moduleRef.get<RequestMessageService>(RequestMessageService)
        generateSignatureService = moduleRef.get(GenerateSignatureService)
        blockchainAuthService = moduleRef.get(getBlockchainAuthServiceToken(Platform.Solana))
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
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
        })
    
        // Assertions
        expect(isJWT(accessToken)).toBe(true)
        expect(isUUID(refreshToken)).toBe(true)
    
        // Check user existence and validate items
        const user = await connection.model<UserSchema>(UserSchema.name).findOne({ accountAddress })

        expect(user).toBeTruthy()
        
        // fetch home and tiles
        const home = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findOne({
            user: user.id,
            placedItemTypeKey: PlacedItemTypeKey.Home
        })
        expect(home).toBeTruthy()

        const tiles = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
            user: user.id,
            placedItemTypeKey: PlacedItemTypeKey.StarterTile
        })
        expect(tiles.length).toBe(6)

        // fetch inventories
        const inventories = await connection.model<InventorySchema>(InventorySchema.name).find({
            user: user.id,
        })
        expect(inventories.length).toBe(1)

        // delete user
        await connection.model<UserSchema>(UserSchema.name).deleteOne({ _id: user.id })
    }
    
    it("should use actual flow", async () => {
        const { message } = await requestMessageService.requestMessage()
        const { publicKey, privateKey } = blockchainAuthService.getKeyPair(0)
        const signature = blockchainAuthService.signMessage({
            message,
            privateKey,
            publicKey
        })

        await verifyAndValidateUserTokens({
            message,
            publicKey,
            signature,
            chainKey: ChainKey.Solana,
            network: Network.Testnet,
            accountAddress: publicKey
        })
    })

    it("should use generated flow", async () => {
        const { message, publicKey, signature, accountAddress, chainKey, network } =
            await generateSignatureService.generateSignature({
                accountNumber: 0,
                chainKey: ChainKey.Solana,
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
        await gameplayConnectionService.closeAll()
    })
})

interface VerifyAndValidateUserTokensParams {
    message: string
    publicKey: string
    signature: string
    chainKey: ChainKey
    network: Network
    accountAddress: string
}
