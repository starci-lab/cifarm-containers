import { Module } from "@nestjs/common"
import { UpgradeService } from "./upgrades.service"
import { UpgradeResolver } from "./upgrades.resolver"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [ GameplayPostgreSQLModule.forFeature() ],
    providers: [UpgradeService, UpgradeResolver]
})
export class UpgradesModule { }
