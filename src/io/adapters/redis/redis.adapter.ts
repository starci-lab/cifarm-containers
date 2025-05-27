import { createAdapter } from "@socket.io/redis-adapter"
import { ServerOptions } from "http"
import { IoRedisClientOrCluster } from "@src/native"
import { IoAdapter } from "@nestjs/platform-socket.io"

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>
    private redisClientOrCluster: IoRedisClientOrCluster

    public setClient(redisClientOrCluster: IoRedisClientOrCluster) {
        this.redisClientOrCluster = redisClientOrCluster
    }

    public async connect(): Promise<void> {
        // if cluster is enabled,
        const pubClient = this.redisClientOrCluster.duplicate()
        const subClient = this.redisClientOrCluster.duplicate() 
        this.adapterConstructor = createAdapter(pubClient, subClient)
    }

    public createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        
        return server
    }
}
