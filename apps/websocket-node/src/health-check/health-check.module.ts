import { Module } from "@nestjs/common"
import { typeOrmForFeature, typeOrmForRoot } from "@src/dynamic-modules"
import { HealthCheckController } from "./health-check.controller"
import { TerminusModule } from "@nestjs/terminus"

@Module({
    imports: [typeOrmForRoot(), typeOrmForFeature(), TerminusModule],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule {}