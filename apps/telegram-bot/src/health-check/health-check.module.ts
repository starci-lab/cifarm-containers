import { Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { HealthCheckController } from "./health-check.controller"
import { PostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        EnvModule.forRoot(),
        PostgreSQLModule.forRoot({
            context:  PostgreSQLContext.Main,
            database: PostgreSQLDatabase.Telegram
        }),
        TerminusModule],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule { }