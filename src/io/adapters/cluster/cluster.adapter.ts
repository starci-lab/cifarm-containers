import { Logger } from "@nestjs/common"
import { createAdapter } from "@starci/socket-io-cluster-adapter"
//import { createAdapter } from "./cluster.dev"
import { ServerOptions } from "http"
import { IoAdapter } from "@nestjs/platform-socket.io"
import { setupWorker } from "@socket.io/sticky"
import cluster from "cluster"

export class ClusterIoAdapter extends IoAdapter {
    private readonly logger = new Logger(ClusterIoAdapter.name)

    private adapterConstructor: ReturnType<typeof createAdapter>

    public connect() {
        // if cluster is not enabled, create a single connection
        this.adapterConstructor = createAdapter()
    }

    public createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        
        // check if the current process is a worker, if so, setup the worker
        // do not need to check env since if worker exist then cluster must be enabled
        if (cluster.isWorker) {
            setupWorker(server)
        }

        return server
    }
}