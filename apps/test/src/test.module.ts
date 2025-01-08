import { Module } from "@nestjs/common"
import { TestController } from "./test.controller"
import { TestService } from "./test.service"
import { GameplayPostgreSQLModule } from "@src/databases"
import { SubModule } from "./sub/sub.module"
import { EnvModule } from "@src/env"

@Module({
    imports: [EnvModule.forRoot(), GameplayPostgreSQLModule.forRoot(), SubModule],
    controllers: [TestController],
    providers: [TestService]
})
export class TestModule {}
