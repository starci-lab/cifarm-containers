// import { NestFactory } from "@nestjs/core"
// import { MicroserviceOptions, Transport } from "@nestjs/microservices"
// import { KafkaGroupId, KafkaOptionsFactory } from "@src/brokers"
// import { Container, envConfig } from "@src/env"
// import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
// import { RedisIoAdapterService } from "@src/io"
// import { AppModule } from "./app.module"
// import cluster from "cluster"
// import { setupMaster, setupWorker } from "@socket.io/sticky"
// import { setupPrimary } from "@socket.io/cluster-adapter"
// import { INestApplication, Logger } from "@nestjs/common"
// import { Server } from "socket.io"
// import { ServeStaticModule } from "@nestjs/serve-static"
// import { join } from "path"

// const logger = new Logger("Bootstrap")

// //create the base app instance
// const createApp = async (): Promise<INestApplication> => {
//     const app = await NestFactory.create(AppModule)
//     const redisIoAdapter = app.get(RedisIoAdapterService)
//     await redisIoAdapter.connectToRedis()
//     app.useWebSocketAdapter(redisIoAdapter)

//     // Kafka Microservice connection
//     const options = app.get(KafkaOptionsFactory)
//     app.connectMicroservice<MicroserviceOptions>({
//         transport: Transport.KAFKA,
//         options: {
//             client: options.createKafkaConfig(),
//             consumer: {
//                 groupId: KafkaGroupId.PlacedItemsBroadcast
//             }
//         }
//     })
//     await app.startAllMicroservices()
//     return app
// }

// // start cluster if enabled
// const startCluster = async (app: INestApplication) => {
//     if (envConfig().containers[Container.WebsocketNode].cluster.enabled) {
//         // Number of workers to fork
//         const numberOfWorkers =
//             envConfig().containers[Container.WebsocketNode].cluster.numberOfWorkers

//         // Setup sticky sessions for load balancing
//         setupMaster(app.getHttpServer(), {
//             loadBalancingMethod: "least-connection"
//         })

//         // Setup primary process
//         setupPrimary()

//         // Serialization setup for worker communication
//         cluster.setupPrimary({
//             serialization: "advanced"
//         })

//         // Fork workers
//         for (let i = 0; i < numberOfWorkers; i++) {
//             cluster.fork()
//         }

//         // Restart worker if it dies
//         cluster.on("exit", (worker) => {
//             console.log(`Worker ${worker.process.pid} died`)
//             cluster.fork()
//         })

//         logger.verbose(`Primary ${process.pid} started`)
//     }
//     await app.listen(envConfig().containers[Container.WebsocketNode].port)
// }

// const startWorker = async () => {
//     const app = await NestFactory.create(AppModule)
//     const redisIoAdapter = app.get(RedisIoAdapterService)
//     await redisIoAdapter.connectToRedis()
//     app.useWebSocketAdapter(redisIoAdapter)

//     // Setup connection with the primary process
//     const io = new Server(app.getHttpServer())
//     setupWorker(io)

//     logger.verbose(`Worker ${process.pid} started`)
// }

// const bootstrapHealthCheck = async () => {
//     // Health check should only run in the master process
//     const app = await NestFactory.create(
//         HealthCheckModule.forRoot({
//             dependencies: [HealthCheckDependency.Kafka, HealthCheckDependency.GameplayPostgreSQL]
//         })
//     )
//     await app.listen(envConfig().containers[Container.WebsocketNode].healthCheckPort)
// }

// const bootstrapUi = async () => {
//     // Health check should only run in the master process
//     const app = await NestFactory.create(
//         ServeStaticModule.forRoot({
//             rootPath: join(process.cwd(), "node_modules", "@socket.io", "admin-ui", "ui", "dist"),
//         }),
//     )
//     await app.listen(9999)
// }

// const launchApplication = async () => {
//     if (cluster.isPrimary) {
//         logger.verbose(`Master ${process.pid} is running`)

//         const app = await createApp()

//         // Handle Kafka, Redis, and WebSocket setup
//         await startCluster(app)
        
//         // Start UI for the admin
//         await bootstrapUi()
//         // Start HealthCheck service ONLY in the master process
//         await bootstrapHealthCheck()
//     } else {
//         // Start worker in case it's not the primary process
//         await startWorker()
//     }
// }

// launchApplication()
