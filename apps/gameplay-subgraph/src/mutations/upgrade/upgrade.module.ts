import { Module } from "@nestjs/common"
import { UpgradeBuildingModule } from "./upgrade-building"

@Module({
    imports: [
        UpgradeBuildingModule
    ]
})
export class UpgradeModule {}
