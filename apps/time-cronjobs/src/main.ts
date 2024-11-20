import { NestFactory } from "@nestjs/core"
import { CronjobModule } from "./cronjob.module"

async function bootstrap() {
    const app = await NestFactory.create(CronjobModule)
    await app.listen(process.env.port ?? 3000)
}
bootstrap()
