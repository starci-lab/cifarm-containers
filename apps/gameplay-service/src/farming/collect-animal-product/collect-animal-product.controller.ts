import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../config"
import { CollectAnimalProductRequest, CollectAnimalProductResponse } from "./collect-animal-product.dto"
import { CollectAnimalProductService } from "./collect-animal-product.service"

@Controller()
export class CollectAnimalProductController {
    private readonly logger = new Logger(CollectAnimalProductController.name)

    constructor(private readonly collectAnimalProductService: CollectAnimalProductService) {}

    @GrpcMethod(gameplayGrpcConstants.service, "CollectAnimalProduct")
    public async collectAnimalProduct(
        @Body() request: CollectAnimalProductRequest
    ): Promise<CollectAnimalProductResponse> {
        this.logger.debug(`Received request to collect animal product: ${JSON.stringify(request)}`)
        return await this.collectAnimalProductService.collectAnimalProduct(request)
    }
}
