import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BuildingEntity, UpgradeEntity } from "@src/database"
import { BuildingsResolver } from "./buildings.resolver"
import { BuildingsService } from "./buildings.service"

@Module({
    imports: [TypeOrmModule.forFeature([BuildingEntity, UpgradeEntity])],
    providers: [BuildingsService, BuildingsResolver],
})
export class BuildingsModule {}
