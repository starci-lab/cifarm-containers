import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { TheifAnimalProductService } from "./theif-animal-product.service"
import { grpcConfig, GrpcServiceName } from "@src/config"
import { TheifAnimalProductRequest } from "./theif-animal-product.dto"

@Controller()
export class TheifAnimalProductController {
    private readonly logger = new Logger(TheifAnimalProductController.name)

    constructor(private readonly theifAnimalProductService: TheifAnimalProductService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "TheifAnimalProduct")
    public async theifAnimalProduct(request: TheifAnimalProductRequest) {
        this.logger.debug("TheifAnimalProduct request called")
        return this.theifAnimalProductService.theifAnimalProduct(request)
    }
}
