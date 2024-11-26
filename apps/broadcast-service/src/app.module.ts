import { Module } from "@nestjs/common"
import { BroadcastPlacedItemsModule } from "./broadcast-placed-items"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { AppController } from "./app.controller"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.main.host,
            port: envConfig().database.postgres.gameplay.main.port,
            username: envConfig().database.postgres.gameplay.main.user,
            password: envConfig().database.postgres.gameplay.main.pass,
            database: envConfig().database.postgres.gameplay.main.dbName,
            autoLoadEntities: true,
            synchronize: true
        }),
        BroadcastPlacedItemsModule
    ],
    controllers: [AppController],
    providers: []
})
export class AppModule {}
