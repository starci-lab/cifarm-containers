import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { gameplayGrpcConstants } from "../../config"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { BuySeedsService } from "./buy-seeds.service"

@Controller()
export class BuySeedsController {
    private readonly logger = new Logger(BuySeedsController.name)

    constructor(private readonly buySeedService: BuySeedsService) {}

    @GrpcMethod(gameplayGrpcConstants.service, "BuySeeds")
    public async buySeeds(request: BuySeedsRequest) {
        this.logger.debug("BuySeeds called")
        return this.buySeedService.buySeeds(request)
    }
}
