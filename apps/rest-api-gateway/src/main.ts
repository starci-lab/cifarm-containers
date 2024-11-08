import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { envConfig } from "@src/config"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    app.enableCors()
    const config = new DocumentBuilder()
        .setVersion("1.0")
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("/api", app, document)
    await app.listen(envConfig().containers.authService.port)
}
bootstrap()
