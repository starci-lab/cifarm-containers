import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { shopGrpcConstants } from "./constants"
import { BuyAnimalRequest, BuyAnimalService } from "./buy-animal"
import { BuySeedsRequest, BuySeedsService } from "./buy-seeds"
import { BuySuppliesRequest, BuySuppliesService } from "./buy-supplies"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
        private readonly buyAnimalService: BuyAnimalService,
        private readonly buySeedService: BuySeedsService,
        private readonly buySuppliesService: BuySuppliesService
    ) {}

    @GrpcMethod(shopGrpcConstants.SERVICE, "BuyAnimal")
    public async buyAnimal(request: BuyAnimalRequest) {
        this.logger.debug("BuyAnimal called")
        return this.buyAnimalService.buyAnimal(request)
    }

    @GrpcMethod(shopGrpcConstants.SERVICE, "BuySeeds")
    public async buySeed(request: BuySeedsRequest) {
        this.logger.debug("BuySeed called")
        return this.buySeedService.buySeeds(request)
    }

    @GrpcMethod(shopGrpcConstants.SERVICE, "BuySupplies")
    public async buySupplies(request: BuySuppliesRequest) {
        this.logger.debug("BuySupplies called")
        return this.buySuppliesService.buySupplies(request)
    }
}
