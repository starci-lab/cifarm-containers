import { Module } from "@nestjs/common"
import { AnimalsResolver } from "./animals.resolver"
import { AnimalsService } from "./animals.service"
import { CacheRedisModule } from "@src/cache"
import { CryptoModule } from "@src/crypto"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [CacheRedisModule.forRoot(), CryptoModule, GameplayPostgreSQLModule.forRoot()],
    providers: [AnimalsService, AnimalsResolver]
})
export class AnimalsModule {}
