import { Module } from "@nestjs/common"
import { EnvModule } from "src/env"
import { CiFarmService } from "./cifarm.service"
import { TelegramUserTrackerPostgreSQLModule } from "@src/databases"

@Module({})
export class CiFarmModule {
    public static forRoot() {
        return {
            module: CiFarmModule,
            imports: [
                EnvModule.forRoot(),
                TelegramUserTrackerPostgreSQLModule.forRoot()
            ],
            providers: [
                CiFarmService
            ],
            exports: []
        }
    }
}