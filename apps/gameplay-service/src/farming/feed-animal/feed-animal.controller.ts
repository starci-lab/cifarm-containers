import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { FeedAnimalService } from "./feed-animal.service"
import { FeedAnimalRequest } from "./feed-animal.dto"
import { grpcConfig } from "@src/config"

@Controller()
export class FeedAnimalController {
    private readonly logger = new Logger(FeedAnimalController.name)

    constructor(private readonly feedAnimalService: FeedAnimalService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "FeedAnimal")
    public async feedAnimal(request: FeedAnimalRequest) {
        this.logger.debug("Feed Animal request called")
        return this.feedAnimalService.feedAnimal(request)
    }
}