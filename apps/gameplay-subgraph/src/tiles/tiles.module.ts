import { Module } from "@nestjs/common"
import { TilesResolver } from "./tiles.resolver"
import { TilesService } from "./tiles.service"
import { CacheRedisModule } from "@src/cache"
import { CryptoModule } from "@src/crypto"
 

@Module({
    imports: [ CacheRedisModule.forRoot(), CryptoModule ],
    providers: [TilesService, TilesResolver]
})
export class TilesModule {}
