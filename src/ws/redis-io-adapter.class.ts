import { IoAdapter } from "@nestjs/platform-socket.io"
import { ServerOptions } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { createClient, createCluster } from "redis"
import { envConfig, redisClusterEnabled, RedisType } from "@src/env"
import { NodeAddressMap } from "@redis/client/dist/lib/cluster/cluster-slots"

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>

    async connectToRedis(params: ConnectToRedisParams = {}): Promise<void> {
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
        const pubClient = createCluster({
            rootNodes: [
                {
                    url: `redis://${envConfig().databases.redis[RedisType.Adapter].host}:${envConfig().databases.redis[RedisType.Adapter].port}`
                }
            ],
            defaults: {
                password: envConfig().databases.redis[RedisType.Adapter].password || undefined
            },
            nodeAddressMap: params.nodeAddressMap
        })

        const subClient = pubClient.duplicate()

        await Promise.all([pubClient.connect(), subClient.connect()])

        this.adapterConstructor = createAdapter(pubClient, subClient)
    }

    createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        return server
    }
}

export interface ConnectToRedisParams {
    nodeAddressMap?: NodeAddressMap
}
