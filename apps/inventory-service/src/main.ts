import { NestFactory } from "@nestjs/core"
import { InventoryServiceModule } from "./inventory-service.module"

async function bootstrap() {
    const app = await NestFactory.create(InventoryServiceModule)
    await app.listen(process.env.port ?? 3000)
}
bootstrap()
