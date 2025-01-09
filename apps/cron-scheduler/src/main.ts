import { NestFactory } from "@nestjs/core"
import { Container, envConfig } from "@src/env"
import { AppModule } from "./app.module"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"

const bootstrap = async () => {
    const app = await NestFactory.createApplicationContext(AppModule)
    app.enableShutdownHooks()
    await app.init()
}
const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule.forRoot({
        dependencies: [
            HealthCheckDependency.CacheRedis,
            HealthCheckDependency.GameplayPostgreSQL,
        ]
    }))
    await app.listen(envConfig().containers[Container.CronScheduler].healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)
