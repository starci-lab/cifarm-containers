import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/config"
import { DataSource } from "typeorm"
import { Logger } from "@nestjs/common"

const createGamplayPostgresqlDatabase = async () => {
    const postgres = new DataSource({
        type: "postgres",
        host: envConfig().database.postgres.gameplay.host,
        port: envConfig().database.postgres.gameplay.port,
        username: envConfig().database.postgres.gameplay.user,
        password: envConfig().database.postgres.gameplay.pass
    })
    const dataSource = await postgres.initialize()

    //Create database
    await dataSource.createQueryRunner().createDatabase("cifarm", true)
}

async function bootstrap() {
    const logger = new Logger("SeedData")
    logger.log("Migration started")
    const app = await NestFactory.createApplicationContext(AppModule)

    await app.init()
    logger.log("Migration finished")
    await app.close()
}

createGamplayPostgresqlDatabase().then(() => bootstrap())
