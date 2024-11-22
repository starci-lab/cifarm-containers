import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { shopGrpcConstants } from "../constants"

@Controller()
export class WaterController {
    private readonly logger = new Logger(WaterController.name)

    constructor(private readonly buyAnimalsService: BuyAnimalsService) {}

    @GrpcMethod(shopGrpcConstants.SERVICE, "BuyAnimals")
    public async buySupply(request: BuyAnimalsRequest) {
        this.logger.debug("BuyAnimals called")
        return this.buyAnimalsService.buyAnimals(request)
    }
}
