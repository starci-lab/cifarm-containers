import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { IdLogger, IdService } from "@src/id"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.useLogger(new IdLogger(app.get(IdService)))
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
