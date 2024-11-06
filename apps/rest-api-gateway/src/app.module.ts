import { Module } from "@nestjs/common"
import { HealthcheckModule } from "./healthcheck"
import { AuthModule } from "./auth"

@Module({
    imports: [
        HealthcheckModule,
        AuthModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
