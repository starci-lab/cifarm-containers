import { Module, ValidationPipe } from "@nestjs/common"
import { APP_PIPE } from "@nestjs/core"
import { cacheRedisModule, typeOrmPostgresqlModule } from "@src/modules"
import { GenerateFakeSignatureModule } from "./generate-fake-signature"
import { RequestMessageModule } from "./request-message"
import { AppController } from "./app.controller"

@Module({
    imports: [
        typeOrmPostgresqlModule,
        cacheRedisModule,
        RequestMessageModule,
        GenerateFakeSignatureModule,
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
