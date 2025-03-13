import { Body, Controller, Logger } from "@nestjs/common"
import { BuyBuildingService } from "./buy-building.service"
import { GrpcMethod } from "@nestjs/microservices"
import { BuyBuildingRequest, BuyBuildingResponse } from "./buy-building.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class BuyBuildingController {
    private readonly logger = new Logger(BuyBuildingController.name)

    constructor(private readonly buyBuildingService: BuyBuildingService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "BuyBuilding")
    public async buyBuilding(
        @Body() request: BuyBuildingRequest
    ): Promise<BuyBuildingResponse> {
        return await this.buyBuildingService.buyBuilding(request)
    }
}
