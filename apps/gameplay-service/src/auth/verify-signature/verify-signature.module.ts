import { Global, Module } from "@nestjs/common"
import { EnergyModule, WalletModule } from "@src/services"
import { VerifySignatureController } from "./verify-signature.controller"
import { VerifySignatureService } from "./verify-signature.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        WalletModule,
    ],
    controllers: [VerifySignatureController],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
