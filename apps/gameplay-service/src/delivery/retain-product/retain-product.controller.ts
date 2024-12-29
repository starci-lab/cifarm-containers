import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { RetainProductService } from "./retain-product.service"
import { RetainProductRequest } from "./retain-product.dto"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class RetainProductController {
    private readonly logger = new Logger(RetainProductController.name)

    constructor(private readonly retainProductService: RetainProductService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "RetainProduct")
    public async buySeed(request: RetainProductRequest) {
        this.logger.debug("RetainProduct called")
        return this.retainProductService.retainProduct(request)
    }
}
