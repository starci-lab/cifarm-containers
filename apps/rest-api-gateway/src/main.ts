import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { envConfig } from "@src/config"
import { ExceptionFilter } from "@src/filters"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.enableCors()

    // Register the global exception filter
    app.useGlobalFilters(new ExceptionFilter())

    const config = new DocumentBuilder()
        .setVersion("1.0")
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                in: "header",
            },
            "access-token",
        )
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("/api", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    })
    await app.listen(envConfig().containers.restApiGateway.port)
}
bootstrap()
