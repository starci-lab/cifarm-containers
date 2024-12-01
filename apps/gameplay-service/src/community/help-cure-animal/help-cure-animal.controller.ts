import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpCureAnimalService } from "./help-cure-animal.service"
import { HelpCureAnimalRequest } from "./help-cure-animal.dto"
import { grpcConfig, GrpcServiceName } from "@src/config"

@Controller()
export class HelpCureAnimalController {
    private readonly logger = new Logger(HelpCureAnimalService.name)

    constructor(private readonly helpCureAnimalService: HelpCureAnimalService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "HelpCureAnimal")
    public async helpCureAnimal(request: HelpCureAnimalRequest) {
        this.logger.debug("HelpCureAniaml called")
        return this.helpCureAnimalService.helpCureAnimal(request)
    }
}
