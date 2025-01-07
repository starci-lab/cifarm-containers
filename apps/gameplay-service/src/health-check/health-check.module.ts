import { Module } from "@nestjs/common"
import { HealthCheckController } from "./health-check.controller"
import { TerminusModule } from "@nestjs/terminus"
import { GameplayPostgreSQLModule } from "@src/databases"
import { EnvModule, RedisType } from "@src/env"
import { ChildProcessDockerRedisClusterModule } from "@src/child-process"

@Module({
    imports: [
        EnvModule.forRoot(),
        GameplayPostgreSQLModule.forRoot(),
        TerminusModule,
        ChildProcessDockerRedisClusterModule.forRoot({
            type: RedisType.Cache
        })
    ],
    controllers: [HealthCheckController],
    providers: [],
    exports: []
})
export class HealthCheckModule { }