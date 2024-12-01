import { Global, Module } from "@nestjs/common"
import { GenerateTestSignatureService } from "./generate-test-signature.service"
import { GenerateTestSignatureController } from "./generate-test-signature.controller"

@Global()
@Module({
    imports: [],
    controllers: [GenerateTestSignatureController],
    providers: [GenerateTestSignatureService],
    exports: [GenerateTestSignatureService]
})
export class GenerateTestSignatureModule {}
