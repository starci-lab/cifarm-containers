import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"
import { GenerateTestSignatureService } from "./generate-test-signature.service"
import {
    AuthModule as BlockchainAuthModule,
} from "@src/services"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([HealthcheckEntity])],
    controllers: [],
    providers: [
        BlockchainAuthModule
    ],
    exports: [GenerateTestSignatureService],
})
export class GenerateTestSignatureModule {}
