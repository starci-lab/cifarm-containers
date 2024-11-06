import { Module, ValidationPipe } from "@nestjs/common"
import { APP_PIPE } from "@nestjs/core"
import { cacheRedisModule, typeOrmPostgresqlModule } from "@src/modules"
import { GenerateTestSignatureModule } from "./generate-test-signature"
import { RequestMessageModule } from "./request-message"
import { AppController } from "./app.controller"
import { ServicesModule } from "@src/services"

@Module({
    imports: [
        typeOrmPostgresqlModule,
        cacheRedisModule,
        ServicesModule,
        RequestMessageModule,
        GenerateTestSignatureModule,
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
