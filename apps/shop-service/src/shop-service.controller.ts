import { Controller, Get } from "@nestjs/common"
import { ShopServiceService } from "./shop-service.service"

@Controller()
export class ShopServiceController {
    constructor(private readonly shopServiceService: ShopServiceService) {}

  @Get()
    getHello(): string {
        return this.shopServiceService.getHello()
    }
}
