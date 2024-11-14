import { Test, TestingModule } from "@nestjs/testing"
import { CommunityServiceController } from "./community-service.controller"
import { CommunityServiceService } from "./community-service.service"

describe("CommunityServiceController", () => {
    let communityServiceController: CommunityServiceController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [CommunityServiceController],
            providers: [CommunityServiceService]
        }).compile()

        communityServiceController = app.get<CommunityServiceController>(CommunityServiceController)
    })

    describe("root", () => {
        it('should return "Hello World!"', () => {
            expect(communityServiceController.getHello()).toBe("Hello World!")
        })
    })
})
