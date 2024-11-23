import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../app.constants"
import { BuyAnimalRequest } from "./buy-animal.dto"
import { BuyAnimalService } from "./buy-animal.service"

@Controller()
export class BuyAnimalsController {
    private readonly logger = new Logger(BuyAnimalsController.name)

    constructor(private readonly buyAnimalService: BuyAnimalService) {}

    @GrpcMethod(gameplayGrpcConstants.SERVICE, "BuyAnimal")
    public async buySupply(request: BuyAnimalRequest) {
        this.logger.debug("BuyAnimals called")
        return this.buyAnimalService.buyAnimal(request)
    }
}
