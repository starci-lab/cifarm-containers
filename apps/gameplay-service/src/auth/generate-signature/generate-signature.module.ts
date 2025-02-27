import { Module } from "@nestjs/common"
import { GenerateSignatureService } from "./generate-signature.service"
import { GenerateSignatureController } from "./generate-signature.controller"
import { RequestMessageModule } from "../request-message"
 
@Module({
    imports: [RequestMessageModule],
    controllers: [GenerateSignatureController],
    providers: [GenerateSignatureService],
})
export class GenerateSignatureModule {
}
