import { Module } from "@nestjs/common"
import { HealthcheckModule } from "./healthcheck"
import { AuthModule } from "./auth"
import { GameplayModule } from "./gameplay"
import { StrategiesModule } from "@src/strategies"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true,
        }),
        StrategiesModule,
        HealthcheckModule,
        AuthModule,
        GameplayModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
