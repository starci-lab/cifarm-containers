import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { BuySuppliesService } from "./buy-supplies.service"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class BuySuppliesController {
    private readonly logger = new Logger(BuySuppliesController.name)

    constructor(private readonly buySupplyService: BuySuppliesService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "BuySupplies")
    public async buySupplies(request: BuySuppliesRequest) {
        this.logger.debug("BuySupplies called")
        return this.buySupplyService.buySupplies(request)
    }
}
