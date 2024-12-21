import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { envConfig } from "@src/config"
import { AppModule } from "./app.module"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.enableCors({
        origin: envConfig().cors.origin,
        credentials: true
    })

    const config = new DocumentBuilder().setVersion("1.0").addBearerAuth().build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("/", app, document, {
        swaggerOptions: {
            persistAuthorization: true
        }
    })
    await app.listen(envConfig().containers.restApiGateway.port)
}
bootstrap()
