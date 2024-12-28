import { Module } from "@nestjs/common"
import { configForRoot, typeOrmForFeature, typeOrmForRoot } from "@src/dynamic-modules"
import { HealthCheckController } from "./health-check.controller"
import { TerminusModule } from "@nestjs/terminus"

@Module({
    imports: [configForRoot(), typeOrmForRoot(), typeOrmForFeature(), TerminusModule],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule { }