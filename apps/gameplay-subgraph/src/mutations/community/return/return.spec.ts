// npx jest apps/gameplay-subgraph/src/mutations/community/return/return.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { GameplayMockUserService, GameplayConnectionService, TestingInfraModule } from "@src/testing"
import { ReturnService } from "./return.service"
import { KafkaTopic } from "@src/brokers"

describe("ReturnService", () => {
    let service: ReturnService
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ReturnService]
        }).compile()

        service = module.get<ReturnService>(ReturnService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
    })

    it("should successfully send return message via Kafka", async () => {
        // Create a user
        const user = await gameplayMockUserService.generate()
        
        // Spy on the kafkaProducer.send method
        const kafkaProducerSpy = jest.spyOn(service["kafkaProducer"], "send")
        
        // Call the return service
        await service.return({ id: user.id })
        
        // Verify that kafkaProducer.send was called with the correct parameters
        expect(kafkaProducerSpy).toHaveBeenCalledWith({
            topic: KafkaTopic.Return,
            messages: [{ value: JSON.stringify({ userId: user.id }) }]
        })
        
        // Restore the original implementation
        kafkaProducerSpy.mockRestore()
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
