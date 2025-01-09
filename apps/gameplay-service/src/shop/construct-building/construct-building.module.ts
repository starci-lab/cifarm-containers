import { Module } from "@nestjs/common"
import { ConstructBuildingController } from "./construct-building.controller"
import { ConstructBuildingService } from "./construct-building.service"
import { GameplayModule } from "@src/gameplay"

@Module({
    imports: [
        GameplayModule
    ],
    controllers: [ConstructBuildingController],
    providers: [ConstructBuildingService],
    exports: [ConstructBuildingService]
})
export class ConstructBuildingModule {}
 