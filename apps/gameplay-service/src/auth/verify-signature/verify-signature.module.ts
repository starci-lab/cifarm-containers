import { Global, Module } from "@nestjs/common"
import { EnergyModule, GoldBalanceModule } from "@src/services"
import { VerifySignatureController } from "./verify-signature.controller"
import { VerifySignatureService } from "./verify-signature.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        GoldBalanceModule,
    ],
    controllers: [VerifySignatureController],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
