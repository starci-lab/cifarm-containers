import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { UseFruitFertilizerRequest } from "./use-fruit-fertilizer.dto"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class UseFruitFertilizerController {
    private readonly logger = new Logger(UseFruitFertilizerController.name)

    constructor(private readonly useFruitFertilizerService: UseFruitFertilizerService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "UseFruitFertilizer")
    public async useFruitFertilizer(request: UseFruitFertilizerRequest) {
        this.logger.debug("Use Fruit Fertilizer request called")
        return this.useFruitFertilizerService.useFruitFertilizer(request)
    }
}
