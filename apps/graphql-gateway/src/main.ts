import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Container, envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { retryIfError } from "@src/common"
import { IdLogger, IdService } from "@src/id"
import { NestExpressApplication } from "@nestjs/platform-express"

const bootstrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.useLogger(new IdLogger(app.get(IdService)))
    app.enableCors({
        origin: envConfig().cors.graphql,
    })
    // trust proxy from the gateway to the subgraphs
    app.set("trust proxy", "loopback")
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
