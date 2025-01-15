import { createAdapter } from "@socket.io/redis-adapter"
import { ServerOptions } from "http"
import { RedisClientOrCluster } from "@src/native"
import { IoAdapter } from "@nestjs/platform-socket.io"

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>
    private redisClientOrCluster: RedisClientOrCluster

    public setClient(redisClientOrCluster: RedisClientOrCluster) {
        this.redisClientOrCluster = redisClientOrCluster
    }

    public connect(): void {
        // if cluster is not enabled, create a single connection
        const pubClient = this.redisClientOrCluster
        const subClient = pubClient.duplicate()
        this.adapterConstructor = createAdapter(pubClient, subClient)
    }

    public createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        
        return server
    }
}
