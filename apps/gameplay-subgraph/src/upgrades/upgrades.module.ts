import { Module } from "@nestjs/common"
import { UpgradeService } from "./upgrades.service"
import { UpgradeResolver } from "./upgrades.resolver"
import { CacheRedisModule } from "@src/cache"
import { CryptoModule } from "@src/crypto"

@Module({
    imports: [ CacheRedisModule.forRoot(), CryptoModule ],
    providers: [UpgradeService, UpgradeResolver]
})
export class UpgradesModule { }
