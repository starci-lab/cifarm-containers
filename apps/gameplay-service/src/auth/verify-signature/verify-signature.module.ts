import { Global, Module } from "@nestjs/common"
import { BlockchainModule } from "@src/blockchain"
import { CacheModule } from "@src/cache"
import { GameplayModule } from "@src/gameplay"
import { JwtModule } from "@src/jwt"
import { VerifySignatureController } from "./verify-signature.controller"
import { VerifySignatureService } from "./verify-signature.service"

@Global()
@Module({
    imports: [CacheModule, GameplayModule, BlockchainModule, JwtModule],
    controllers: [VerifySignatureController],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
