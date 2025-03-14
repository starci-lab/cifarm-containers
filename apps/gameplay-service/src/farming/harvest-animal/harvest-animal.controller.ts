import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { HarvestAnimalRequest, HarvestAnimalResponse } from "./harvest-animal.dto"
import { HarvestAnimalService } from "./harvest-animal.service"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class HarvestAnimalController {
    private readonly logger = new Logger(HarvestAnimalController.name)

    constructor(private readonly harvestAnimalService: HarvestAnimalService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "HarvestAnimal")
    public async harvestAnimal(
        @Body() request: HarvestAnimalRequest
    ): Promise<HarvestAnimalResponse> {
        this.logger.debug(`Received request to collect animal product: ${JSON.stringify(request)}`)
        return await this.harvestAnimalService.harvestAnimal(request)
    }
}
