import { Injectable } from "@nestjs/common"
import { IoAdapter } from "@nestjs/platform-socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { ServerOptions } from "http"
import { InjectRedis, RedisClientOrCluster } from "@src/native"

@Injectable()
export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>
    constructor(
        @InjectRedis()
        private readonly redisClientOrCluster: RedisClientOrCluster
    ) {
        super()
    }

    public async connectToRedis(): Promise<void> {
        // if cluster is not enabled, create a single connection
        const pubClient = this.redisClientOrCluster
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

