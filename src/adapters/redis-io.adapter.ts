import { IoAdapter } from "@nestjs/platform-socket.io"
import { ServerOptions } from "socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { createClient } from "redis"
import { envConfig } from "@src/config"

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>

    async connectToRedis(): Promise<void> {
        const pubClient = createClient({
            url: `redis://${envConfig().database.redis.adapter.host}:${envConfig().database.redis.adapter.port}`,
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
