import { Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { HealthcheckController } from "./healthcheck.controller"
import { TerminusModule } from "@nestjs/terminus"

@Module({
    imports: [typeOrmForFeature(), TerminusModule],
    controllers: [HealthcheckController],
    providers: [],
    exports: []
})
export class HealthcheckModule {}