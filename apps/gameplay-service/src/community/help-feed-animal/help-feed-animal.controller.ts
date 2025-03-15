import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpFeedAnimalService } from "./help-feed-animal.service"
import { HelpFeedAnimalRequest } from "./help-feed-animal.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class HelpFeedAnimalController {
    private readonly logger = new Logger(HelpFeedAnimalService.name)

    constructor(private readonly helpFeedAnimalService: HelpFeedAnimalService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "HelpFeedAnimal")
    public async helpFeedAnimal(request: HelpFeedAnimalRequest) {
        this.logger.debug("HelpFeedAnimal called")
        return this.helpFeedAnimalService.helpFeedAnimal(request)
    }
}
