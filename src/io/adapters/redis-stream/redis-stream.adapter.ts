import { createAdapter } from "@socket.io/redis-streams-adapter"
import { ServerOptions } from "http"
import { RedisClientOrCluster } from "@src/native"
import { IoAdapter } from "@nestjs/platform-socket.io"

export class RedisStreamIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>
    private redisClientOrCluster: RedisClientOrCluster

    public setClient(redisClientOrCluster: RedisClientOrCluster) {
        this.redisClientOrCluster = redisClientOrCluster
    }

    public connect(): void {
        // if cluster is not enabled, create a single connection
        const client = this.redisClientOrCluster
        this.adapterConstructor = createAdapter(client)
    }

    public createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        
        return server
    }
}
