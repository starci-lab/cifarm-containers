import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DeliverProductService } from "./deliver-product.service"
import { DeliverProductRequest } from "./deliver-product.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class DeliverProductController {
    private readonly logger = new Logger(DeliverProductController.name)

    constructor(private readonly deliverProductService: DeliverProductService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "DeliverProduct")
    public async buySeed(request: DeliverProductRequest) {
        this.logger.debug("DeliverProduct called")
        return this.deliverProductService.deliverProduct(request)
    }
}
