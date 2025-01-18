// npx jest apps/gameplay-service/src/auth/request-message/request-message.spec.ts 

import { ConnectionService, TestingInfraModule } from "@src/testing"
import { Test } from "@nestjs/testing"
import { Cache } from "cache-manager"
import { CACHE_MANAGER } from "@src/cache"
import { RequestMessageService } from "./request-message.service"
import { isUUID } from "class-validator"

describe("RequestMessageService", () => {
    let service: RequestMessageService
    let cache: Cache
    let connectionService: ConnectionService
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register(),
            ],
            providers: [
                RequestMessageService
            ]
        }).compile()

        cache = moduleRef.get(CACHE_MANAGER)
        service = moduleRef.get(RequestMessageService)
        
        connectionService = moduleRef.get(ConnectionService)
    })

    it("should return a valid UUID and store it in the cache", async () => {
        const result = await service.requestMessage()
        // Check if the result is a valid UUID
        expect(isUUID(result.message)).toBe(true)
        // Check if the message is stored in cache
        const cached = await cache.get(result.message)
        expect(cached).toBeTruthy()
    })

    afterAll(async () => {
        await connectionService.closeAll()
    })
})