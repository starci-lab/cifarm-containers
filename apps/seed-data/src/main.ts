import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/config"
import { Logger } from "@nestjs/common"
import { createDatabase } from "@src/utils"

const createGamplayPostgresqlDatabase = async () =>
    createDatabase({
        type: "postgres",
        host: envConfig().database.postgres.gameplay.host,
        port: envConfig().database.postgres.gameplay.port,
        user: envConfig().database.postgres.gameplay.user,
        pass: envConfig().database.postgres.gameplay.pass,
        dbName: envConfig().database.postgres.gameplay.dbName
    })

const bootstrap = async () => {
    const logger = new Logger("SeedData")
    logger.log("Migration started")
    const app = await NestFactory.createApplicationContext(AppModule)

    await app.init()
    logger.log("Migration finished")
    await app.close()
}

createGamplayPostgresqlDatabase().then(() => bootstrap())
