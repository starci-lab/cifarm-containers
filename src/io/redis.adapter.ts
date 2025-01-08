import { Injectable } from "@nestjs/common"
import { IoAdapter } from "@nestjs/platform-socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { envConfig, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import { ExecDockerRedisClusterService } from "@src/exec"
import { ServerOptions } from "http"
import { createClient, createCluster } from "redis"
import { NatMap } from "ioredis"

@Injectable()
export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>
    constructor(private readonly execDockerRedisClusterService: ExecDockerRedisClusterService) {
        super()
    }

    public async connectToRedis(): Promise<void> {
        const clusterEnabled = redisClusterEnabled(RedisType.Adapter)
        // if cluster is not enabled, create a single connection
        if (!clusterEnabled) {
            const pubClient = createClient({
                url: `redis://${envConfig().databases.redis[RedisType.Adapter].host}:${envConfig().databases.redis[RedisType.Adapter].port}`,
                password: envConfig().databases.redis[RedisType.Adapter].password || undefined
            })
            const subClient = pubClient.duplicate()
            await Promise.all([pubClient.connect(), subClient.connect()])
            this.adapterConstructor = createAdapter(pubClient, subClient)
            return
        }
        // if cluster is enabled, create a cluster connection
        let nodeAddressMap: NatMap
        if (redisClusterRunInDocker(RedisType.Adapter)) {
            nodeAddressMap = this.execDockerRedisClusterService.getNatMap()
        }
        const pubClient = createCluster({
            rootNodes: [
                {
                    url: `redis://${envConfig().databases.redis[RedisType.Adapter].host}:${envConfig().databases.redis[RedisType.Adapter].port}`
                }
            ],
            defaults: {
                password: envConfig().databases.redis[RedisType.Adapter].password || undefined
            },
            nodeAddressMap
        })

        const subClient = pubClient.duplicate()

        await Promise.all([pubClient.connect(), subClient.connect()])

        this.adapterConstructor = createAdapter(pubClient, subClient)
    }

    public createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        return server
    }
}
