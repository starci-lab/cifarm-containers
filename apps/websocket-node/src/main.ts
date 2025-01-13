import { NestFactory } from "@nestjs/core"
import { Container, envConfig, loadEnv } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { AppModule } from "./app.module"
import { createPrimaryServer, IO_ADAPTER_FACTORY, IoAdapterFactory } from "@src/io"
import { MicroserviceOptions, Transport } from "@nestjs/microservices"
import { KafkaOptionsFactory, KafkaGroupId } from "@src/brokers"
import cluster from "cluster"
import { INestApplication, Logger } from "@nestjs/common"
import { AdminUiModule } from "./admin-ui.module"

const addAdapter = async (app: INestApplication) => {
    const factory = app.get<IoAdapterFactory>(IO_ADAPTER_FACTORY)
    const adapter = factory.createAdapter(app)
    await adapter.connect()
    app.useWebSocketAdapter(adapter)
}

const addMicroservices = async (app: INestApplication) => {
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

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await addAdapter(app)
    await addMicroservices(app)
    await app.listen(envConfig().containers[Container.WebsocketNode].port)
}

const bootstrapMaster = async () => {
    const logger = new Logger(bootstrapMaster.name)
    await loadEnv()
    await createPrimaryServer(envConfig().containers[Container.WebsocketNode].port, logger)
}

const bootstrapWorker = async () => {
    const logger = new Logger(bootstrapWorker.name)
    logger.verbose(`Worker ${process.pid} started`)

    const app = await NestFactory.create(AppModule)
    await addMicroservices(app)
    await addAdapter(app)
    await app.listen(envConfig().containers[Container.WebsocketNode].cluster.workerPort)
}

const bootstrapAll = async () => {
    if (!envConfig().containers[Container.WebsocketNode].cluster.enabled) {
        await bootstrap().then(bootstrapHealthCheck).then(bootstrapAdminUi)
        return
    }

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
    const app = await NestFactory.create(AdminUiModule)
    await app.listen(envConfig().containers[Container.WebsocketNode].adminUiPort)
}

bootstrapAll()
