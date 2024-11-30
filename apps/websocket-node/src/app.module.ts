import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { BroadcastModule } from "./broadcast"
import { cacheRegisterAsync, configForRoot, typeOrmForRoot } from "@src/dynamic-modules"
@Module({
    imports: [
        configForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        AuthModule,
        BroadcastModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
