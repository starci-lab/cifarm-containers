import { Module } from "@nestjs/common"
import { DoHealthcheckModule } from "./do-healthcheck"
import { AppController } from "./app.controller"
import { typeOrmPostgresqlModule } from "@src/modules"

@Module({
    imports: [
        DoHealthcheckModule,
        typeOrmPostgresqlModule
    ],
    controllers: [
        AppController
    ],
})
export class AppModule {}
