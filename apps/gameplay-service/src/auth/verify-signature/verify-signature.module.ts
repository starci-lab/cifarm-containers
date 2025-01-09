import { Module } from "@nestjs/common"
import { VerifySignatureController } from "./verify-signature.controller"
import { VerifySignatureService } from "./verify-signature.service"

 
@Module({
    imports: [],
    controllers: [VerifySignatureController],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
