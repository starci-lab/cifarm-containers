import { Injectable } from "@nestjs/common"
import { createAdapter } from "@socket.io/redis-adapter"
import { ServerOptions } from "http"
import { InjectRedis, RedisClientOrCluster } from "@src/native"
import { IoAdapter } from "./io.types"

@Injectable()
export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>
    constructor(
        @InjectRedis()
        private readonly redisClientOrCluster: RedisClientOrCluster
    ) {
        super()
    }

    public async connect(): Promise<void> {
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

