import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { VerifySignatureController } from "./verify-signature.controller"
import { VerifySignatureService } from "./verify-signature.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    controllers: [VerifySignatureController],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
