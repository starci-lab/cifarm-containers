import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/config"
import { INestApplication } from "@nestjs/common"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    connectSubgraph(app)
}
bootstrap()

async function connectSubgraph(app: INestApplication<unknown>) {
    try {
        await app.listen(envConfig().containers.graphqlApiGateway.port)
    } catch (e) {
        console.error(e)
        await new Promise((resolve) => setTimeout(resolve, 5000)) //wait 5 second
        connectSubgraph(app)
    }
}
