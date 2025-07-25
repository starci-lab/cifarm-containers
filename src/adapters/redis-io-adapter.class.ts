import { IoAdapter } from "@nestjs/platform-socket.io"
import { ServerOptions } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { createClient } from "redis"
import { envConfig } from "@src/env"

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>

    async connectToRedis(): Promise<void> {
        const pubClient = createClient({
            url: `redis://${envConfig().databases.redis.adapter.host}:${envConfig().databases.redis.adapter.port}`,
        })
        const subClient = pubClient.duplicate()

        await Promise.all([pubClient.connect(), subClient.connect()])

        this.adapterConstructor = createAdapter(pubClient, subClient, {
            requestsTimeout: 10000,
        })
    }

    createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        return server
    }
}
