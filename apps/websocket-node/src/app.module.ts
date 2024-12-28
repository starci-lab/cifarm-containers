import { Module } from "@nestjs/common"
import { cacheRegisterAsync, configForRoot, schedulerForRoot, typeOrmForRoot } from "@src/dynamic-modules"
import { BroadcastModule } from "./broadcast"
import { DefaultModule } from "./default"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "path"

@Module({
    imports: [
        configForRoot(),
        cacheRegisterAsync(),
        typeOrmForRoot(),
        schedulerForRoot(),
        BroadcastModule,
        DefaultModule,
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), "node_modules", "@socket.io", "admin-ui", "ui", "dist"),
        }),
    ],
    controllers: [],
    providers: []
})
export class AppModule {}
