import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(envConfig().containers[Container.GraphQLGateway].port)
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(
        HealthCheckModule.forRoot({
            dependencies: [HealthCheckDependency.GameplaySubgraph]
        })
    )
    await app.listen(envConfig().containers[Container.GraphQLGateway].healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)
