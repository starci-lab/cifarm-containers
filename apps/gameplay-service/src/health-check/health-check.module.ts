import { Module } from "@nestjs/common"
import { configForRoot} from "@src/dynamic-modules"
import { HealthCheckController } from "./health-check.controller"
import { TerminusModule } from "@nestjs/terminus"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        configForRoot(),
        GameplayPostgreSQLModule.forRoot(),
        TerminusModule
    ],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule { }