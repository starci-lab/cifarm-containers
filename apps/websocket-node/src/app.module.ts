import { Module } from "@nestjs/common"
import { BroadcastModule } from "./broadcast"
import { cacheRegisterAsync, configForRoot, typeOrmForRoot } from "@src/dynamic-modules"
@Module({
    imports: [
        configForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        BroadcastModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
