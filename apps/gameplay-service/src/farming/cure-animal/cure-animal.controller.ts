import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { CureAnimalRequest } from "./cure-animal.dto"
import { CureAnimalService } from "./cure-animal.service"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class CureAnimalController {
    private readonly logger = new Logger(CureAnimalController.name)

    constructor(private readonly cureAnimalService: CureAnimalService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "CureAnimal")
    public async cureAnimal(request: CureAnimalRequest) {
        this.logger.debug("Cure Animal request received")
        return this.cureAnimalService.cureAnimal(request)
    }
}
