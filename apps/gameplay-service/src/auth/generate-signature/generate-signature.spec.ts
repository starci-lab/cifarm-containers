// npx jest apps/gameplay-service/src/auth/generate-signature/generate-signature.spec.ts

import { GenerateSignatureService } from "./generate-signature.service"
import { GameplayConnectionService, TestingInfraModule } from "@src/testing"
import { Test } from "@nestjs/testing"
import { Cache } from "cache-manager"
import { CACHE_MANAGER } from "@src/cache"
import { Network, ChainKey } from "@src/env"
import { isUUID } from "class-validator"  // Assuming you'd want to check if the message is a valid UUID.
import { RequestMessageService } from "../request-message"

describe("GenerateSignatureService", () => {
    let service: GenerateSignatureService
    let cache: Cache
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register(),
            ],
            providers: [
                RequestMessageService,
                GenerateSignatureService
            ]
        }).compile()

        service = moduleRef.get(GenerateSignatureService)
        cache = moduleRef.get(CACHE_MANAGER)  // Ensure cache is injected
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should generate a valid Solana signature and store it in cache", async () => {
        const chainKey = ChainKey.Solana
        const network = Network.Testnet
        const result = await service.generateSignature({
            accountNumber: 0,
            chainKey,
            network
        })

        // Assert: Check that the message is a valid UUID
        expect(isUUID(result.message)).toBe(true)

        // Assert: Check that the message is cached
        const cached = await cache.get(result.message)
        expect(cached).toBeTruthy() // Ensure the message is cached

        // Assert: Check if signature and other details are present
        expect(result.signature).toBeTruthy()
        expect(result.accountAddress).toBeTruthy()
        expect(result.chainKey).toBe(chainKey)
        expect(result.network).toBe(network)
        expect(result.publicKey).toBeTruthy()
    })

    afterAll(async () => {
        await gameplayConnectionService.closeAll()
    })
})
