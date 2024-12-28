import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { HealthCheckModule } from "./health-check"
import { envConfig } from "@src/config"

const bootstrap = async () => {
    const app = await NestFactory.createApplicationContext(AppModule)
    await app.init()
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule)
    await app.listen(envConfig().containers.cronWorker.healthCheckPort)
}
bootstrap().then(bootstrapHealthCheck)
