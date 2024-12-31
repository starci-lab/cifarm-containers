import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/env"
import { HealthCheckModule } from "./health-check"

const bootstrap = async () => {
    const app = await NestFactory.createApplicationContext(AppModule)
    await app.init()
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule)
    await app.listen(envConfig().containers.telegramBot.healthCheckPort)
}
bootstrap().then(bootstrapHealthCheck)
