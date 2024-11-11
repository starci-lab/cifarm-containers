import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { shopGrpcConstants } from "./constants"
import { BuyAnimalRequest, BuyAnimalService } from "./buy-animal"


@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
    private readonly buyAnimalService: BuyAnimalService
    ) {}

  @GrpcMethod(shopGrpcConstants.SERVICE, "BuyAnimal")
    public async buyAnimal(request: BuyAnimalRequest) {
        this.logger.debug("BuyAnimal called")
        return this.buyAnimalService.buyAnimal(request)
    }

}
