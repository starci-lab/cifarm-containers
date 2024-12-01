import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { BuyAnimalRequest } from "./buy-animal.dto"
import { BuyAnimalService } from "./buy-animal.service"
import { grpcConfig } from "@src/config"

@Controller()
export class BuyAnimalController {
    private readonly logger = new Logger(BuyAnimalController.name)

    constructor(private readonly buyAnimalService: BuyAnimalService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "BuyAnimal")
    public async buyAnimal(request: BuyAnimalRequest) {
        this.logger.debug("BuyAnimal called")
        return this.buyAnimalService.buyAnimal(request)
    }
}
