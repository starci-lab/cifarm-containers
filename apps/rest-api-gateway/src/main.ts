import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/env"
import { HealthCheckDependency, HealthCheckModule } from "@src/health-check"
import { VersioningType } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule, SwaggerCustomOptions } from "@nestjs/swagger"
import { GameplayModule as GameplayV1Module } from "./v1"
import { GrpcToHttpInterceptor } from "nestjs-grpc-exceptions"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.enableCors({
        origin: envConfig().cors.origin,
        credentials: true,
    })
    app.useGlobalInterceptors(new GrpcToHttpInterceptor())

    const options = new DocumentBuilder()
        .setTitle("CiFarm API")
        .setDescription("The CiFarm API description")
        .setVersion("1.0")
        .build()

    // Create main API document
    const document = SwaggerModule.createDocument(app, options)

    app.enableVersioning({
        type: VersioningType.URI,
    })

    // Custom Swagger UI options
    const customOptions: SwaggerCustomOptions = {
        explorer: true,
        customSiteTitle: "CiFarm API",
        swaggerOptions: {
            persistAuthorization: true,
            urls: [
                { name: "Version 1", url: "/v1/swagger.json" },
                { name: "Version 2", url: "/v2/swagger.json" },
            ],
        },
    }

    SwaggerModule.setup("/", app, document, customOptions)

    // Version 1 Swagger Config
    const configV1 = new DocumentBuilder()
        .setTitle("CiFarm API - V1")
        .setDescription("The CiFarm API V1 description")
        .setVersion("1.0")
        .addBearerAuth()
        .build()

    const documentV1 = SwaggerModule.createDocument(app, configV1, {
        include: [GameplayV1Module],
    })

    SwaggerModule.setup("/v1", app, documentV1, {
        ...customOptions,
        jsonDocumentUrl: "/v1/swagger.json",
    })

    // Version 2 Swagger Config
    const configV2 = new DocumentBuilder()
        .setTitle("CiFarm API - V2")
        .setDescription("The CiFarm API V2 description")
        .setVersion("2.0")
        .addBearerAuth()
        .build()

    const documentV2 = SwaggerModule.createDocument(app, configV2, {
        include: [],
    })

    SwaggerModule.setup("/v2", app, documentV2, {
        ...customOptions,
        jsonDocumentUrl: "/v2/swagger.json",
    })

    await app.listen(envConfig().containers.restApiGateway.port)
}

const bootstrapHealthCheck = async () => {
    const app = await NestFactory.create(HealthCheckModule.forRoot({
        dependencies: [
            HealthCheckDependency.GameplayService,
        ]
    }))
    await app.listen(envConfig().containers.restApiGateway.healthCheckPort)
}

bootstrap().then(bootstrapHealthCheck)