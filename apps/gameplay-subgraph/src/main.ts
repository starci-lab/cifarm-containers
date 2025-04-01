import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { IdLogger, IdService } from "@src/id"
import { NestExpressApplication } from "@nestjs/platform-express"

const bootstrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.useLogger(new IdLogger(app.get(IdService)))
    app.set("trust proxy", "loopback")  
    await app.listen(envConfig().containers.gameplaySubgraph.port)
}
const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(
        HealthCheckModule.forRoot({
            dependencies: [
                HealthCheckDependency.CacheRedis,
                HealthCheckDependency.GameplayMongoDb
            ]
        })
    )

    await app.listen(envConfig().containers.gameplaySubgraph.healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)
