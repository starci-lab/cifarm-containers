import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { retryIfError } from "@src/common"
import { IdLogger, IdService } from "@src/id"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.enableCors()
    app.useLogger(new IdLogger(app.get(IdService)))
    //peform a retry if the app fails to listen
    await retryIfError(async () =>
        app.listen(envConfig().containers[Container.GraphQLGateway].port)
    )
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(
        HealthCheckModule.forRoot({
            dependencies: [HealthCheckDependency.GameplaySubgraph]
        })
    )
    app.listen(envConfig().containers[Container.GraphQLGateway].healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)
