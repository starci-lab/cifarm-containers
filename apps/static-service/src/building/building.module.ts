import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BuildingEntity, UpgradeEntity } from "@src/database"
import { BuildingController } from "./building.controller"
import { BuildingService } from "./building.service"

@Module({
    imports: [TypeOrmModule.forFeature([BuildingEntity, UpgradeEntity])],
    controllers: [BuildingController],
    providers: [BuildingService],
    exports: [BuildingService]
})
export class BuildingModule {}
