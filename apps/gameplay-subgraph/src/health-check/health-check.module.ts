import { Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { HealthCheckController } from "./health-check.controller"
import { TerminusModule } from "@nestjs/terminus"

@Module({
    imports: [typeOrmForFeature(), TerminusModule],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule {}