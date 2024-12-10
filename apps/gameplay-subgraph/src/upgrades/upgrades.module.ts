import { Module } from "@nestjs/common"
import { UpgradeService } from "./upgrades.service"
import { UpgradeResolver } from "./upgrades.resolver"

@Module({
    providers: [UpgradeService, UpgradeResolver]
})
export class UpgradesModule { }
