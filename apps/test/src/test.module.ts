import { Module } from "@nestjs/common"
import { TestController } from "./test.controller"
import { TestService } from "./test.service"
import { PostgreSQLModule } from "@src/databases"
import { SubModule } from "./sub/sub.module"
import { EnvModule } from "@src/env"
import { CacheModule } from "@src/cache"

@Module({
    imports: [SubModule, EnvModule.forRoot(), PostgreSQLModule.forRoot(), CacheModule.forRoot()],
    controllers: [TestController],
    providers: [TestService]
})
export class TestModule {}
