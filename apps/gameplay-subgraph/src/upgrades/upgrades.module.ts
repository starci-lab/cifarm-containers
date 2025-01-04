import { Module } from "@nestjs/common"
import { UpgradeService } from "./upgrades.service"
import { UpgradeResolver } from "./upgrades.resolver"
import { CacheRedisModule } from "@src/cache"
import { CryptoModule } from "@src/crypto"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot(), CacheRedisModule.forRoot(), CryptoModule ],
    providers: [UpgradeService, UpgradeResolver]
})
export class UpgradesModule { }
