import { UpgradeResolver } from "@apps/gameplay-subgraph/src/upgrades/upgrades.resolver"
import { UpgradeService } from "@apps/gameplay-subgraph/src/upgrades/upgrades.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [UpgradeService, UpgradeResolver]
})
export class UpgradesModule { }
