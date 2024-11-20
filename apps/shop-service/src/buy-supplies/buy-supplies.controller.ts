import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { shopGrpcConstants } from "../constants"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { BuySuppliesService } from "./buy-supplies.service"

@Controller()
export class BuySuppliesController {
    private readonly logger = new Logger(BuySuppliesController.name)

    constructor(private readonly buySupplyService: BuySuppliesService) {}

    @GrpcMethod(shopGrpcConstants.SERVICE, "BuySupplies")
    public async buySupply(request: BuySuppliesRequest) {
        this.logger.debug("BuySupplies called")
        return this.buySupplyService.buySupplies(request)
    }
}
