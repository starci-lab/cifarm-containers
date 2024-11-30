import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../config"
import { CureAnimalRequest } from "./cure-animal.dto"
import { CureAnimalService } from "./cure-animal.service"

@Controller()
export class CureAnimalController {
    private readonly logger = new Logger(CureAnimalController.name)

    constructor(private readonly cureAnimalService: CureAnimalService) {}

    @GrpcMethod(gameplayGrpcConstants.service, "CureAnimal")
    public async cureAnimal(request: CureAnimalRequest) {
        this.logger.debug("Cure Animal request received")
        return this.cureAnimalService.cureAnimal(request)
    }
}
