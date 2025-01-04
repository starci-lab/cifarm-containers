import { Module } from "@nestjs/common"
import { SystemsService } from "./systems.service"
import { SystemsResolver } from "./systems.resolver"
import { CacheRedisModule } from "@src/cache"
import { CryptoModule } from "@src/crypto"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ 
        GameplayPostgreSQLModule.forRoot(),
        CacheRedisModule.forRoot(), CryptoModule
    ],
    providers: [SystemsService, SystemsResolver]
})
export class SystemsModule {}
