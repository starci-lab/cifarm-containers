import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { RedisIoAdapter } from "@src/adapters"
import { envConfig } from "@src/config"
//
const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)

    const redisIoAdapter = new RedisIoAdapter(app)
    await redisIoAdapter.connectToRedis()
    app.useWebSocketAdapter(redisIoAdapter)

    await app.listen(envConfig().containers.websocketApiGateway.port)
}
bootstrap()
