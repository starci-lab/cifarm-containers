import { Module } from "@nestjs/common"
import { HealthCheckController } from "./health-check.controller"
import { TerminusModule } from "@nestjs/terminus"
import { GameplayPostgreSQLModule } from "@src/databases"
import { ChildProcessDockerRedisClusterModule } from "@src/child-process"
import { RedisType } from "@src/env"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        TerminusModule,
        ChildProcessDockerRedisClusterModule.forRoot({
            type: RedisType.Adapter
        })
    ],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule {}
