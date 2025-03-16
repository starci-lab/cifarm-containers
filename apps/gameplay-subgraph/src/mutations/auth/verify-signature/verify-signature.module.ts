import { Module } from "@nestjs/common"
import { VerifySignatureService } from "./verify-signature.service"
import { VerifySignatureResolver } from "./verify-signature.resolver"
 
@Module({   
    providers: [VerifySignatureService, VerifySignatureResolver],
})
export class VerifySignatureModule {}
