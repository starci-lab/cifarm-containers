import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { HealthCheckModule, HealthCheckDependency } from "@src/health-check"
import { envConfig } from "@src/env"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(envConfig().containers.gameplaySubgraph.port)
}
const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(
        HealthCheckModule.forRoot({
            dependencies: [
                HealthCheckDependency.CacheRedis,
                HealthCheckDependency.GameplayPostgreSQL
            ]
        })
    )

    await app.listen(envConfig().containers.gameplaySubgraph.healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)
