import { Module } from "@nestjs/common"
import { BroadcastModule } from "./broadcast"
import { DefaultModule } from "./default"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "path"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { CacheModule } from "@src/cache"
import { PostgreSQLModule } from "@src/databases"

@Module({
    imports: [
        EnvModule.forRoot(),
        CacheModule.register({
            isGlobal: true
        }),
        PostgreSQLModule.forRoot({
            context: PostgreSQLContext.Main,
            database: PostgreSQLDatabase.Gameplay
        }),
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
