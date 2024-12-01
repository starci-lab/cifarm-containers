import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { TheifAnimalProductService } from "./theif-animal-product.service"
import { grpcConfig } from "@src/config"
import { TheifAnimalProductRequest } from "./theif-animal-product.dto"

@Controller()
export class TheifAnimalProductController {
    private readonly logger = new Logger(TheifAnimalProductController.name)

    constructor(private readonly theifAnimalProductService: TheifAnimalProductService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "TheifAnimalProduct")
    public async theifAnimalProduct(request: TheifAnimalProductRequest) {
        this.logger.debug("TheifAnimalProduct request called")
        return this.theifAnimalProductService.theifAnimalProduct(request)
    }
}
