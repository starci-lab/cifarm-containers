import { Global, Module } from "@nestjs/common"
import { BlockchainModule } from "@src/blockchain"
import { GameplayPostgreSQLModule } from "@src/databases"
import { GameplayModule } from "@src/gameplay"
import { JwtModule } from "@src/jwt"
import { VerifySignatureController } from "./verify-signature.controller"
import { VerifySignatureService } from "./verify-signature.service"
import { CacheRedisModule } from "@src/cache"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
        CacheRedisModule.forRoot(),
        GameplayModule,
        BlockchainModule,
        JwtModule
    ],
    controllers: [VerifySignatureController],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
