import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { PlantSeedService } from "./plant-seed.service"
import { PlantSeedRequest } from "./plant-seed.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class PlantSeedController {
    private readonly logger = new Logger(PlantSeedController.name)

    constructor(private readonly plantSeedService: PlantSeedService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "PlantSeed")
    public async plantSeed(request: PlantSeedRequest) {
        this.logger.debug("PlantSeed called")
        return this.plantSeedService.plantSeed(request)
    }
}
