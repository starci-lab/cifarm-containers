import { Test, TestingModule } from "@nestjs/testing"
import { ShopServiceController } from "./shop-service.controller"
import { ShopServiceService } from "./shop-service.service"

describe("ShopServiceController", () => {
    let shopServiceController: ShopServiceController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [ShopServiceController],
            providers: [ShopServiceService],
        }).compile()

        shopServiceController = app.get<ShopServiceController>(ShopServiceController)
    })

    describe("root", () => {
        it("should return \"Hello World!\"", () => {
            expect(shopServiceController.getHello()).toBe("Hello World!")
        })
    })
})
