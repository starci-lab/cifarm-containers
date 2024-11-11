import { Module } from "@nestjs/common"
import { HealthcheckModule } from "./healthcheck"
import { AuthModule } from "./auth"
import { GameplayModule } from "./gameplay"
import { StrategiesModule } from "@src/strategies"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { ShopModule } from "./shop"

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
        ShopModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
