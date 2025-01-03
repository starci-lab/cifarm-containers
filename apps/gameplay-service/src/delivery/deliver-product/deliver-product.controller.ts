import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DeliverProductService } from "./deliver-product.service"
import { DeliverProductRequest } from "./deliver-product.dto"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class DeliverProductController {
    private readonly logger = new Logger(DeliverProductController.name)

    constructor(private readonly deliverProductService: DeliverProductService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "DeliverProduct")
    public async buySeed(request: DeliverProductRequest) {
        this.logger.debug("DeliverProduct called")
        return this.deliverProductService.deliverProduct(request)
    }
}
