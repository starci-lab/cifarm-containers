import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/env"
import { HealthCheckModule, HealthCheckDependency } from "@src/health-check"

const bootstrap = async () => {
    const app = await NestFactory.createApplicationContext(AppModule)
    app.enableShutdownHooks()
    await app.init()
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule.forRoot({
        dependencies: [
            HealthCheckDependency.GameplayMongoDb
        ]
    }))
    await app.listen(envConfig().containers.telegramBot.healthCheckPort)
}
bootstrap().then(bootstrapHealthCheck)
