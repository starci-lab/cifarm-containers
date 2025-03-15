import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HelpUseFruitFertilizerService } from "./help-use-fruit-fertilizer.service"
import { HelpUseFruitFertilizerRequest } from "./help-use-fruit-fertilizer.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class HelpUseFruitFertilizerController {
    private readonly logger = new Logger(HelpUseFruitFertilizerService.name)

    constructor(private readonly helpUseFruitFertilizerService: HelpUseFruitFertilizerService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "HelpUseFruitFertilizer")
    public async helpUseFruitFertilizer(request: HelpUseFruitFertilizerRequest) {
        this.logger.debug("HelpUseFruitFertilizer called")
        return this.helpUseFruitFertilizerService.helpUseFruitFertilizer(request)
    }
}
