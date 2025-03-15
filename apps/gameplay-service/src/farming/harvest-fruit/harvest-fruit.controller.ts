import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HarvestFruitService } from "./harvest-fruit.service"
import { HarvestFruitRequest } from "./harvest-fruit.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class HarvestFruitController {
    private readonly logger = new Logger(HarvestFruitController.name)

    constructor(private readonly harvestFruitService: HarvestFruitService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "HarvestFruit")
    public async harvestFruit(request: HarvestFruitRequest) {
        return this.harvestFruitService.harvestFruit(request)
    }
}
