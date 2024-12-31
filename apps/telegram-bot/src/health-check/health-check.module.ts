import { Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import { TelegramUserTrackerPostgreSQLModule } from "@src/databases"
import { EnvModule } from "@src/env"
import { HealthCheckController } from "./health-check.controller"

@Module({
    imports: [
        EnvModule.forRoot(),
        TelegramUserTrackerPostgreSQLModule.forRoot(),
        TerminusModule],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule { }