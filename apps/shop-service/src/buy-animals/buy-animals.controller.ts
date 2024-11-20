import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { shopGrpcConstants } from "../constants"
import { BuyAnimalsService } from "./buy-animals.service"
import { BuyAnimalsRequest } from "./buy-animals.dto"

@Controller()
export class BuyAnimalsController {
    private readonly logger = new Logger(BuyAnimalsController.name)

    constructor(private readonly buyAnimalsService: BuyAnimalsService) {}

    @GrpcMethod(shopGrpcConstants.SERVICE, "BuyAnimals")
    public async buySupply(request: BuyAnimalsRequest) {
        this.logger.debug("BuyAnimals called")
        return this.buyAnimalsService.buyAnimals(request)
    }
}
