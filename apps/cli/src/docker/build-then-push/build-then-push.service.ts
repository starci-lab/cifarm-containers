import { Logger } from "@nestjs/common"
import { SubCommand, CommandRunner } from "nest-commander"
import { ExecDockerCoreService } from "@src/exec/exec-docker-core.service"
import { Container } from "@src/env"
import cluster from "cluster"
import os from "os"

@SubCommand({ name: "build-then-push", description: "Build then push the docker images" })
export class BuildThenPushCommand extends CommandRunner {
    private readonly logger = new Logger(BuildThenPushCommand.name)

    constructor(
        private readonly execDockerCoreService: ExecDockerCoreService
    ) {
        super()
    }

    async run(): Promise<void> {
        const numCPUs = os.cpus().length // Get the number of CPU cores available
        const containerKeys = Object.values(Container)

        if (cluster.isPrimary) {
            // We only need as many workers as containers, so we fork 10 workers
            const numWorkers = Math.min(containerKeys.length, numCPUs)  // Use the smaller of numCPUs or number of containers
            this.logger.log(`Master process is running. Forking ${numWorkers} workers...`)

            // Distribute containers evenly among workers
            const chunkSize = Math.ceil(containerKeys.length / numWorkers)
            for (let i = 0; i < numWorkers; i++) {
                const workerContainers = containerKeys.slice(i * chunkSize, (i + 1) * chunkSize)
                const worker = cluster.fork()

                // Send a message to the worker with the containers it needs to handle
                worker.send(workerContainers)
            }

            // Listen for messages from workers
            cluster.on("message", (worker, message) => {
                if (message === "done") {
                    this.logger.debug(`Worker ${worker.id} has finished processing`)
                }
            })

            // Handle worker exit
            cluster.on("exit", (worker) => {
                this.logger.log(`Worker ${worker.id} died`)
            })

        } else {
            // Worker process: Handle the assigned containers
            process.on("message", async (containers: Array<Container>) => {
                try {
                    this.logger.log(`Worker ${cluster.worker.id} is processing containers`)

                    // Perform build and push tasks in parallel for this worker's containers
                    const promises = containers.map(container => (async () => {
                        await this.execDockerCoreService.build(container)
                        this.logger.debug(`Worker ${cluster.worker.id} built ${container}`)
                        await this.execDockerCoreService.push(container)
                    }))

                    // Wait for all promises to finish
                    await Promise.all(promises)
                    this.logger.log(`Worker ${cluster.worker.id} completed the task`)

                    // Send a message back to the master process
                    process.send("done")
                } catch (error) {
                    this.logger.error(`Error in worker ${cluster.worker.id}: ${error.message}`)
                    process.send("done")
                }
            })
        }
    }
}
