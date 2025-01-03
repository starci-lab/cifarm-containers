import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { telegramUserTrackerPostgreSqlEntites } from "./entities"
import { envConfig } from "@src/env"
import { TelegramUserTrackerPostgreSQLService } from "./telegram-user-tracker-postgresql.service"

@Module({
    imports: [],
    controllers: [],
    providers: [],
    exports: [TelegramUserTrackerPostgreSQLService],
})
export class TelegramUserTrackerPostgreSQLModule {
    public static forRoot() {
        return {
            module: TelegramUserTrackerPostgreSQLModule,
            imports: [
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().databases.postgresql.telegramUserTracker.main.host,
                    port: envConfig().databases.postgresql.telegramUserTracker.main.port,
                    username: envConfig().databases.postgresql.telegramUserTracker.main.username,
                    password: envConfig().databases.postgresql.telegramUserTracker.main.password,
                    database: envConfig().databases.postgresql.telegramUserTracker.main.dbName,
                    entities: telegramUserTrackerPostgreSqlEntites(),
                    synchronize: true,
                    poolSize: 10,
                    connectTimeoutMS: 5000,
                }),
                TypeOrmModule.forFeature(telegramUserTrackerPostgreSqlEntites()),
            ],
            providers: [TelegramUserTrackerPostgreSQLService],
            exports: [TelegramUserTrackerPostgreSQLService],
        }
    }
}
