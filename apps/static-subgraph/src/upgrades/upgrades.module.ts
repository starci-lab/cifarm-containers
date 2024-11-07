import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BuildingEntity, UpgradeEntity } from "@src/database"
import { UpgradesResolver } from "./upgrades.resolver"
import { UpgradesService } from "./upgrades.service"

@Module({
    imports: [TypeOrmModule.forFeature([BuildingEntity, UpgradeEntity])],
    providers: [UpgradesService, UpgradesResolver],
})
export class UpgradesModule {}
