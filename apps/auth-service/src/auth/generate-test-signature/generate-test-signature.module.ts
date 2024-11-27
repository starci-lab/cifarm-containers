import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"
import { GenerateTestSignatureService } from "./generate-test-signature.service"
import { GenerateTestSignatureController } from "./generate-test-signature.controller"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([HealthcheckEntity])],
    controllers: [GenerateTestSignatureController],
    providers: [GenerateTestSignatureService],
    exports: [GenerateTestSignatureService]
})
export class GenerateTestSignatureModule {}
