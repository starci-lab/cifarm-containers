import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/config"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(envConfig().containers.graphqlMaingraph.port)
}
bootstrap()