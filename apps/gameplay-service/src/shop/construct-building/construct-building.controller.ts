import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ApiBearerAuth } from "@nestjs/swagger"
import { shopGrpcConstants } from "../constants"
import { ConstructBuildingRequest } from "./construct-building.dto"
import { ConstructBuildingService } from "./construct-building.service"

@ApiBearerAuth()
@Controller("shop")
export class ConstructBuildingController {
    private readonly logger = new Logger(ConstructBuildingController.name)

    constructor(private readonly constructBuilding: ConstructBuildingService) {}

    @GrpcMethod(shopGrpcConstants.SERVICE, "ConstructBuilding")
    public async buySupply(request: ConstructBuildingRequest) {
        this.logger.debug("ConstructBuilding called")
        return this.constructBuilding.constructBuilding(request)
    }
}
