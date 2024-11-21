import { NestFactory } from "@nestjs/core"
import { FarmingServiceModule } from "./farming-service.module"

async function bootstrap() {
    const app = await NestFactory.create(FarmingServiceModule)
    await app.listen(process.env.port ?? 3000)
}
bootstrap()
