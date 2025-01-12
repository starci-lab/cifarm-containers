import { Logger } from "@nestjs/common"
import { createAdapter } from "@socket.io/cluster-adapter"
import { ServerOptions } from "http"
import { IoAdapter } from "@nestjs/platform-socket.io"

export class ClusterIoAdapter extends IoAdapter {
    private logger = new Logger(ClusterIoAdapter.name)

    private adapterConstructor: ReturnType<typeof createAdapter>

    public async connect(): Promise<void> {
        // if cluster is not enabled, create a single connection
        this.adapterConstructor = createAdapter()
    }

    public createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        return server
    }
}