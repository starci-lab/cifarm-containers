import { Module } from "@nestjs/common"
import { ConstructBuildingController } from "./construct-building.controller"
import { ConstructBuildingService } from "./construct-building.service"

@Module({
    controllers: [ConstructBuildingController],
    providers: [ConstructBuildingService]
})
export class ConstructBuildingModule {}
 