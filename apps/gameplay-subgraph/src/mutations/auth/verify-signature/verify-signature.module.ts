import { Module } from "@nestjs/common"
import { VerifySignatureService } from "./verify-signature.service"
import { VerifySignatureResolver } from "./verify-signature.resolver"
 
@Module({   
    providers: [VerifySignatureService, VerifySignatureResolver],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
