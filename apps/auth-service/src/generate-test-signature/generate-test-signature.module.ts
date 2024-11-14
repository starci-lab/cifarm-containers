import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"
import { GenerateTestSignatureService } from "./generate-test-signature.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([HealthcheckEntity])],
    controllers: [],
    providers: [GenerateTestSignatureService],
    exports: [GenerateTestSignatureService]
})
export class GenerateTestSignatureModule {}
