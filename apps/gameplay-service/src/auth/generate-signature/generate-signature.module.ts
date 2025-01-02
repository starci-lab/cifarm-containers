import { Global, Module } from "@nestjs/common"
import { GenerateSignatureService } from "./generate-signature.service"
import { GenerateSignatureController } from "./generate-signature.controller"

@Global()
@Module({
    imports: [],
    controllers: [GenerateSignatureController],
    providers: [GenerateSignatureService],
    exports: [GenerateSignatureService]
})
export class GenerateSignatureModule {}
