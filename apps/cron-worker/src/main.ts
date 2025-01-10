import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Container, envConfig } from "@src/env"
import { HealthCheckModule, HealthCheckDependency } from "@src/health-check"

const bootstrap = async () => {
    const app = await NestFactory.createApplicationContext(AppModule)
    await app.init()
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule.forRoot({
        dependencies: [
            HealthCheckDependency.CacheRedis,
            HealthCheckDependency.GameplayPostgreSQL,
        ]
    }))
    console.log(Number.parseInt(process.env.CRON_WORKER_HEALTH_CHECK_PORT))
    await app.listen(envConfig().containers[Container.CronWorker].healthCheckPort)
}
bootstrap().then(bootstrapHealthCheck)
