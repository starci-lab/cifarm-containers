import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { BuyAnimalsService } from "./buy-animals.service"
import { BuyAnimalsRequest } from "./buy-animals.dto"
import { shopGrpcConstants } from "../../constants"

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
