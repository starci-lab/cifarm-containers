import { NestFactory } from "@nestjs/core"
import { Container, envConfig, loadEnv } from "@src/env"
import { AppModule } from "./app.module"
import { createPrimaryServer, IO_ADAPTER_FACTORY, IoAdapterFactory } from "@src/io"
import cluster from "cluster"
import { Logger } from "@nestjs/common"
import { join } from "path"
import { ServeStaticModule } from "@nestjs/serve-static"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { IdLogger, IdService } from "@src/id"
import { NestExpressApplication } from "@nestjs/platform-express"
import { IncomingMessage, Server, ServerResponse } from "http"

const addAdapter = async (
    app: NestExpressApplication<Server<typeof IncomingMessage, typeof ServerResponse>>
) => {
    const factory = app.get<IoAdapterFactory>(IO_ADAPTER_FACTORY)
    const adapter = factory.createAdapter(app)
    await adapter.connect()
    // trust proxy from the gateway to the subgraphs
    app.set("trust proxy", "loopback")
    app.useLogger(new IdLogger(app.get(IdService)))
    app.useWebSocketAdapter(adapter)
}

const bootstrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    await addAdapter(app)
    await app.listen(envConfig().containers[Container.IoGameplay].port)
}

const bootstrapMaster = async () => {
    const logger = new Logger(bootstrapMaster.name)
    await loadEnv()
    await createPrimaryServer(envConfig().containers[Container.IoGameplay].port, logger)
}

const bootstrapWorker = async () => {
    const logger = new Logger(bootstrapWorker.name)
    logger.verbose(`Worker ${process.pid} started`)

    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    await addAdapter(app)
    await app.listen(envConfig().containers[Container.IoGameplay].cluster.workerPort)
}

const bootstrapAll = async () => {
    if (!envConfig().containers[Container.IoGameplay].cluster.enabled) {
        await bootstrap().then(bootstrapHealthCheck).then(bootstrapAdminUI)
        return
    }

    if (cluster.isPrimary) {
        await bootstrapMaster().then(bootstrapHealthCheck).then(bootstrapAdminUI)
    } else {
        await bootstrapWorker()
    }
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(
        HealthCheckModule.forRoot({
            dependencies: [
                HealthCheckDependency.Kafka,
                HealthCheckDependency.GameplayMongoDb,
                HealthCheckDependency.CacheRedis,
                HealthCheckDependency.AdapterRedis
            ]
        })
    )
    await app.listen(envConfig().containers[Container.IoGameplay].healthCheckPort)
}

const bootstrapAdminUI = async () => {
    const app = await NestFactory.create(
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), "node_modules", "@socket.io", "admin-ui", "ui", "dist")
        })
    )
    await app.listen(envConfig().containers[Container.IoGameplay].adminUiPort)
}

bootstrapAll()
