import { Module } from "@nestjs/common"
import { HealthCheckController } from "./health-check.controller"
import { TerminusModule } from "@nestjs/terminus"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [GameplayPostgreSQLModule.forRoot(), TerminusModule],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule { }