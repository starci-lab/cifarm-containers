import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { HealthCheckModule } from "./health-check"
import { envConfig } from "@src/env"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(envConfig().containers.gameplaySubgraph.port)
}
const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule)
    await app.listen(envConfig().containers.gameplaySubgraph.healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)