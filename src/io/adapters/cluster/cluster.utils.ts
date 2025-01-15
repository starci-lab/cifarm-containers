import { Logger } from "@nestjs/common"
import { setupPrimary } from "@starci/socket-io-cluster-adapter"
//import { setupPrimary } from "./cluster.dev"
import { setupMaster } from "@socket.io/sticky"
import { Container, envConfig } from "@src/env"
import cluster from "cluster"
import http from "http"

export const createPrimaryServer = async (port: number, logger: Logger) => {
    const httpServer = http.createServer()
    // Create HTTP server
    logger.verbose(`Primary ${process.pid} is running`)
    const numberOfWorkers = envConfig().containers[Container.WebsocketNode].cluster.numberOfWorkers

    // Setup sticky sessions for load balancing
    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection"
    })

    // Setup primary process
    setupPrimary()

    // Serialization setup for worker communication
    cluster.setupPrimary({
        serialization: "advanced"
    })

    // Fork workers
    for (let i = 0; i < numberOfWorkers; i++) {
        cluster.fork()
    }

    // Restart worker if it dies
    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`)
        cluster.fork()
    })

    //await addListener(app)
    httpServer.listen(port)
}
