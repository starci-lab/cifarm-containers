import { Test, TestingModule } from "@nestjs/testing"
import { UnfollowController } from "./unfollow.controller"

describe("UnfollowController", () => {
    let controller: UnfollowController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UnfollowController]
        }).compile()

        controller = module.get<UnfollowController>(UnfollowController)
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })
})
