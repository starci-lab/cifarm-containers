import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { PlantSeedService } from "./plant-seed.service"
import { PlantSeedRequest } from "./plant-seed.dto"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class PlantSeedController {
    private readonly logger = new Logger(PlantSeedController.name)

    constructor(private readonly plantSeedService: PlantSeedService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "PlantSeed")
    public async plantSeed(request: PlantSeedRequest) {
        this.logger.debug("PlantSeed called")
        return this.plantSeedService.plantSeed(request)
    }
}
