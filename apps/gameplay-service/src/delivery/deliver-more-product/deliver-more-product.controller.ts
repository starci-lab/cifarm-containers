import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DeliverMoreProductService } from "./deliver-more-product.service"
import { DeliverMoreProductRequest } from "./deliver-more-product.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class DeliverMoreProductController {
    private readonly logger = new Logger(DeliverMoreProductController.name)

    constructor(private readonly deliverMoreProductService: DeliverMoreProductService) { }

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "DeliverMoreProduct")
    public async deliverMoreProduct(request: DeliverMoreProductRequest) {
        return this.deliverMoreProductService.deliverMoreProduct(request)
    }
}
