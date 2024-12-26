import { Module } from "@nestjs/common"
import { HealthcheckController } from "./healthcheck.controller"
import { TerminusModule } from "@nestjs/terminus"
import { HttpModule } from "@nestjs/axios"

@Module({
    imports: [TerminusModule, HttpModule],
    controllers: [HealthcheckController],
    providers: [],
    exports: []
})
export class HealthcheckModule {}