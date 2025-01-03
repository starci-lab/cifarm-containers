import { Module } from "@nestjs/common"
import { AnimalsResolver } from "./animals.resolver"
import { AnimalsService } from "./animals.service"
import { CacheRedisModule } from "@src/cache"
import { CryptoModule } from "@src/crypto"

@Module({
    imports: [ CacheRedisModule.forRoot(), CryptoModule ],
    providers: [AnimalsService, AnimalsResolver]
})
export class AnimalsModule {}
