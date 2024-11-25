import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { SeedDataModule } from "./seed-data"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        SeedDataModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
