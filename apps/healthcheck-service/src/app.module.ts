import { Module } from "@nestjs/common"
import { DoHealthcheckModule } from "./do-healthcheck"
import { AppController } from "./app.controller"
import { typeOrmGameplayPostgresqlModule } from "@src/modules"

@Module({
    imports: [
        DoHealthcheckModule,
        typeOrmGameplayPostgresqlModule
    ],
    controllers: [
        AppController
    ],
})
export class AppModule {}
