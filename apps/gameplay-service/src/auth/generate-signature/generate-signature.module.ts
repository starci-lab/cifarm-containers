import { Module } from "@nestjs/common"
import { GenerateSignatureService } from "./generate-signature.service"
import { GenerateSignatureController } from "./generate-signature.controller"
import { AuthModule } from "@src/blockchain"

 
@Module({
    imports: [AuthModule],
    controllers: [GenerateSignatureController],
    providers: [GenerateSignatureService],
    exports: [GenerateSignatureService]
})
export class GenerateSignatureModule {}
