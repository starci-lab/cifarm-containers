import { Module } from "@nestjs/common"
import { BuildingsResolver } from "./buildings.resolver"
import { BuildingsService } from "./buildings.service"
import { CryptoModule } from "@src/crypto"
import { CacheRedisModule } from "@src/cache"
 

@Module({
    imports: [ CryptoModule, CacheRedisModule.forRoot() ],
    providers: [ BuildingsService, BuildingsResolver ]
})
export class BuildingsModule {}
