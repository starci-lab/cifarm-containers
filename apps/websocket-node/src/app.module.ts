import { Module } from "@nestjs/common"
import { cacheRegisterAsync, configForRoot, typeOrmForRoot } from "@src/dynamic-modules"
import { BroadcastModule } from "./broadcast"
@Module({
    imports: [
        configForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        BroadcastModule,
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
