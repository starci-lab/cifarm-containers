import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

export const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(8656)
}
bootstrap()
