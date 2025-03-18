import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Container, envConfig } from "@src/env"
import { HealthCheckModule, HealthCheckDependency } from "@src/health-check"
import { IdService } from "@src/id"
import { IdLogger } from "@src/id"

const bootstrap = async () => {
    const app = await NestFactory.createApplicationContext(AppModule)
    app.useLogger(new IdLogger(app.get(IdService)))
    await app.init()
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule.forRoot({
        dependencies: [
            HealthCheckDependency.CacheRedis,
            HealthCheckDependency.GameplayMongoDb,
        ]
    }))
    await app.listen(envConfig().containers[Container.CronWorker].healthCheckPort)
}
bootstrap().then(bootstrapHealthCheck)
