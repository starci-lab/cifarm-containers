import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ThiefAnimalProductService } from "./thief-animal-product.service"
import { grpcData, GrpcServiceName } from "@src/grpc"
import { ThiefAnimalProductRequest } from "./thief-animal-product.dto"

@Controller()
export class ThiefAnimalProductController {
    private readonly logger = new Logger(ThiefAnimalProductController.name)

    constructor(private readonly thiefAnimalProductService: ThiefAnimalProductService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "ThiefAnimalProduct")
    public async thiefAnimalProduct(request: ThiefAnimalProductRequest) {
        this.logger.debug("ThiefAnimalProduct request called")
        return this.thiefAnimalProductService.theifAnimalProduct(request)
    }
}
