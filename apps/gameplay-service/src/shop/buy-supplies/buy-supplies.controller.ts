import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { BuySuppliesService } from "./buy-supplies.service"
import { grpcConfig } from "@src/config"

@Controller()
export class BuySuppliesController {
    private readonly logger = new Logger(BuySuppliesController.name)

    constructor(private readonly buySupplyService: BuySuppliesService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "BuySupplies")
    public async buySupplies(request: BuySuppliesRequest) {
        this.logger.debug("BuySupplies called")
        return this.buySupplyService.buySupplies(request)
    }
}
