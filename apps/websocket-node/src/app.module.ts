import { Module } from "@nestjs/common"
import { BroadcastModule } from "./broadcast"
import { DefaultModule } from "./default"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "path"
import { EnvModule } from "@src/env"
import { CacheRedisModule, GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        EnvModule.forRoot(),
        CacheRedisModule.forRoot(),
        GameplayPostgreSQLModule.forRoot(),
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
