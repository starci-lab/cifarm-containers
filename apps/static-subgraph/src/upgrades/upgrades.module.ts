import { UpgradeResolver } from "@apps/static-subgraph/src/upgrades/upgrades.resolver"
import { UpgradeService } from "@apps/static-subgraph/src/upgrades/upgrades.service"
import { Module } from "@nestjs/common"

@Module({
    providers: [UpgradeService, UpgradeResolver]
})
export class UpgradesModule {}
