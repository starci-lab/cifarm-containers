import { Test, TestingModule } from "@nestjs/testing"
import { FarmingServiceController } from "./farming-service.controller"
import { FarmingServiceService } from "./farming-service.service"

describe("FarmingServiceController", () => {
    let farmingServiceController: FarmingServiceController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [FarmingServiceController],
            providers: [FarmingServiceService]
        }).compile()

        farmingServiceController = app.get<FarmingServiceController>(FarmingServiceController)
    })

    describe("root", () => {
        it('should return "Hello World!"', () => {
            expect(farmingServiceController.getHello()).toBe("Hello World!")
        })
    })
})
