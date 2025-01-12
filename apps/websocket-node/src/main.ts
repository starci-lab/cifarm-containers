import { NestFactory } from "@nestjs/core"
import { Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { AppModule } from "./app.module"
import { IO_ADAPTER_FACTORY, IoAdapterFactory } from "@src/io"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { KafkaOptionsFactory, KafkaGroupId } from "@src/brokers"
import cluster from "cluster"
import { setupMaster, setupWorker } from "@socket.io/sticky"
import { INestApplication, Logger } from "@nestjs/common"
import { Server } from "socket.io"
import { join } from "path"
import { ServeStaticModule } from "@nestjs/serve-static"
import { setupPrimary } from "@socket.io/cluster-adapter"

const addAdapter = async (app: INestApplication) => {
    const factory = app.get<IoAdapterFactory>(IO_ADAPTER_FACTORY)
    console.log(factory)
    const adapter = factory.createAdapter(app)
    await adapter.connect()
    app.useWebSocketAdapter(adapter)
}

const addKafka = async (app: INestApplication) => {
    const options = app.get(KafkaOptionsFactory)
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
}

const addListener = async (app: INestApplication) => {
    await app.listen(envConfig().containers[Container.WebsocketNode].port)
}

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await addAdapter(app)
    await addKafka(app)
    await addListener(app)
}

const bootstrapMaster = async () => {
    const logger = new Logger(bootstrapMaster.name)
    const app = await NestFactory.create(AppModule)

    await addKafka(app)

    logger.verbose(`Primary ${process.pid} is running`)
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

    await addListener(app)
}

const bootstrapWorker = async () => {
    const logger = new Logger(bootstrapWorker.name)
    logger.verbose(`Worker ${process.pid} started`)

    const app = await NestFactory.create(AppModule)
    await addAdapter(app)

    // Setup connection with the primary process
    const io = new Server(app.getHttpServer())
    setupWorker(io)
}

const bootstrapAll = async () => {
    if (!envConfig().containers[Container.WebsocketNode].cluster.enabled) {
        await bootstrap().then(bootstrapHealthCheck).then(bootstrapAdminUi)
        return
    }

    if (cluster.isPrimary) {
        await bootstrapMaster()
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

bootstrapAll()
