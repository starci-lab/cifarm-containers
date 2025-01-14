import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { RetainProductService } from "./retain-product.service"
import { RetainProductRequest } from "./retain-product.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class RetainProductController {
    private readonly logger = new Logger(RetainProductController.name)

    constructor(private readonly retainProductService: RetainProductService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "RetainProduct")
    public async buySeed(request: RetainProductRequest) {
        this.logger.debug("RetainProduct called")
        return this.retainProductService.retainProduct(request)
    }
}
