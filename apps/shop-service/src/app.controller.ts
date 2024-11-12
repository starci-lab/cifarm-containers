import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { shopGrpcConstants } from "./constants"
import { BuyAnimalRequest, BuyAnimalService } from "./buy-animal"
import { BuySeedsRequest, BuySeedsService } from "./buy-seeds"


@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
    private readonly buyAnimalService: BuyAnimalService,
    private readonly buySeedService: BuySeedsService,
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

}
