import { Module } from "@nestjs/common"
import { cacheRegisterAsync, configForRoot, typeOrmForRoot } from "@src/dynamic-modules"
import { BroadcastModule } from "./broadcast"
import { HealthCheckModule } from "./health-check"

@Module({
    imports: [
        configForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        BroadcastModule,
        HealthCheckModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
