import { Module } from "@nestjs/common"
import { GenerateSignatureService } from "./generate-signature.service"
import { GenerateSignatureController } from "./generate-signature.controller"
import { RequestMessageModule } from "../request-message"
import { BlockchainModule } from "@src/blockchain"
 
@Module({
    imports: [BlockchainModule.register(), RequestMessageModule],
    controllers: [GenerateSignatureController],
    providers: [GenerateSignatureService],
    exports: [GenerateSignatureService]
})
export class GenerateSignatureModule {}
