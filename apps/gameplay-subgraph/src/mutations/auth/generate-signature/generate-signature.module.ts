import { Module } from "@nestjs/common"
import { GenerateSignatureService } from "./generate-signature.service"
import { GenerateSignatureResolver } from "./generate-signature.resolver"
import { RequestMessageModule } from "../request-message"
 
@Module({
    imports: [RequestMessageModule],
    providers: [GenerateSignatureService, GenerateSignatureResolver],
})
export class GenerateSignatureModule {
}
