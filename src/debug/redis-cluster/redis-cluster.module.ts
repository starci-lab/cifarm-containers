import { Module } from "@nestjs/common"
import { RedisClusterDebugService } from "./redis-cluster.service"

@Module({
    providers: [RedisClusterDebugService],
})
export class RedisClusterDebugModule { }