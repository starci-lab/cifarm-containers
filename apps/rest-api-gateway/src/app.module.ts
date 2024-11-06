import { Module } from "@nestjs/common"
import { HealthcheckModule } from "./healthcheck"
import { AuthModule } from "./auth"
import { GameplayModule } from "./gameplay"
import { StrategiesModule } from "@src/strategies"

@Module({
    imports: [
        StrategiesModule,
        HealthcheckModule,
        AuthModule,
        GameplayModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
