import { Module } from "@nestjs/common"
import { BuildingsResolver } from "./buildings.resolver"
import { BuildingsService } from "./buildings.service"
import { CryptoModule } from "@src/crypto"
import { CacheRedisModule } from "@src/cache"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ CryptoModule, CacheRedisModule.forRoot(),  GameplayPostgreSQLModule.forFeature() ],
    providers: [ BuildingsService, BuildingsResolver ]
})
export class BuildingsModule {}
