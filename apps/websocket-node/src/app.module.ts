import { Module } from "@nestjs/common"
import { cacheRegisterAsync, configForRoot, typeOrmForRoot } from "@src/dynamic-modules"
import { AuthModule } from "./auth"
import { BroadcastModule } from "./broadcast"
@Module({
    imports: [
        configForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        AuthModule,
        BroadcastModule,
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
