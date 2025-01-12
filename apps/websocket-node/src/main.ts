import { NestFactory } from "@nestjs/core"
import { Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { AppModule } from "./app.module"
import { IO_ADAPTER_FACTORY, IoAdapterFactory } from "@src/io"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { KafkaOptionsFactory, KafkaGroupId } from "@src/brokers"
import cluster from "cluster"
import { setupMaster, setupWorker } from "@socket.io/sticky"
import { Logger } from "@nestjs/common"
import { Server } from "socket.io"
import { join } from "path"
import { ServeStaticModule } from "@nestjs/serve-static"
import { setupPrimary } from "@socket.io/cluster-adapter"

const createApp = async () => {
    const app = await NestFactory.create(AppModule)
    const factory = app.get<IoAdapterFactory>(IO_ADAPTER_FACTORY)
    const adapter = factory.createAdapter(app)
    await adapter.connect()
    app.useWebSocketAdapter(adapter)
    return app
}

const bootstrapMaster = async () => {
    const logger = new Logger(bootstrapMaster.name)
    const app = await createApp()

    const options = app.get(KafkaOptionsFactory)
    // Connect to Kafka microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: options.createKafkaConfig(),
            consumer: {
                groupId: KafkaGroupId.PlacedItemsBroadcast
            }
        }
    })
    await app.startAllMicroservices()

    if (envConfig().containers[Container.WebsocketNode].cluster.enabled) {
        logger.log(`Master ${process.pid} is running`)
        if (cluster.isPrimary) {
            console.log(`Primary ${process.pid} is running`)
            const numberOfWorkers =
                envConfig().containers[Container.WebsocketNode].cluster.numberOfWorkers

            // Setup sticky sessions for load balancing
            setupMaster(app.getHttpServer(), {
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
        }
    }

    await app.listen(envConfig().containers[Container.WebsocketNode].port)
}

const bootstrapWorker = async () => {
    const logger = new Logger(bootstrapWorker.name)
    logger.verbose(`Worker ${process.pid} started`)

    const app = await createApp()

    // Setup connection with the primary process
    const io = new Server(app.getHttpServer())
    setupWorker(io)
}

const bootstrap = async () => {
    if (cluster.isPrimary) {
        await bootstrapMaster().then(bootstrapHealthCheck).then(bootstrapAdminUi)
    } else {
        await bootstrapWorker()
    }
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(
        HealthCheckModule.forRoot({
            dependencies: [HealthCheckDependency.Kafka, HealthCheckDependency.GameplayPostgreSQL]
        })
    )
    await app.listen(envConfig().containers[Container.WebsocketNode].healthCheckPort)
}

const bootstrapAdminUi = async () => {
    const app = await NestFactory.create(
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), "node_modules", "@socket.io", "admin-ui", "ui", "dist")
        })
    )
    await app.listen(envConfig().containers[Container.WebsocketNode].adminUiPort)
}
bootstrap()
