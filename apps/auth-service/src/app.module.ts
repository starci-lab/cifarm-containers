import { Module, ValidationPipe } from "@nestjs/common"
import { APP_PIPE } from "@nestjs/core"
import { ServicesModule } from "@src/services"
import { cacheRedisModule, typeOrmPostgresqlModule } from "@src/modules"

@Module({
    imports: [typeOrmPostgresqlModule, cacheRedisModule, ServicesModule],
    controllers: [],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
    ],
})
export class AppModule {}
