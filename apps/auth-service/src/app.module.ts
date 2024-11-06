import { Module, ValidationPipe } from "@nestjs/common"
import { APP_PIPE } from "@nestjs/core"
import { cacheRedisModule, configModule, typeOrmPostgresqlModule } from "@src/modules"
import { GenerateTestSignatureModule } from "./generate-test-signature"
import { RequestMessageModule } from "./request-message"
import { AppController } from "./app.controller"
import { AuthModule as BlockchainAuthModule, JwtModule } from "@src/services"
import { VerifySignatureModule } from "./verify-signature"

@Module({
    imports: [
        configModule,
        typeOrmPostgresqlModule,
        cacheRedisModule,
        BlockchainAuthModule,
        JwtModule,
        RequestMessageModule,
        GenerateTestSignatureModule,
        VerifySignatureModule
    ], 
    controllers: [AppController],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
    ],
})
export class AppModule {}
