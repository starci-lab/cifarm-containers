import { Module } from "@nestjs/common"
import { HealthCheckController } from "./health-check.controller"
import { TerminusModule } from "@nestjs/terminus"
import { HttpModule } from "@nestjs/axios"

@Module({
    imports: [TerminusModule, HttpModule],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule {}