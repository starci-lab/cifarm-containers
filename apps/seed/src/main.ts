import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { envConfig } from "@src/config"
import { Logger } from "@nestjs/common"
import { createDatabase } from "@src/utils"

const createGamplayPostgresqlDatabase = async () => {
    await createDatabase({
        type: "postgres",
        host: envConfig().database.postgres.gameplay.main.host,
        port: envConfig().database.postgres.gameplay.main.port,
        user: envConfig().database.postgres.gameplay.main.user,
        pass: envConfig().database.postgres.gameplay.main.pass,
        dbName: envConfig().database.postgres.gameplay.main.dbName
    })
}

const createTestGamplayPostgresqlDatabase = async () => {
    await createDatabase({
        type: "postgres",
        host: envConfig().database.postgres.gameplay.test.host,
        port: envConfig().database.postgres.gameplay.test.port,
        user: envConfig().database.postgres.gameplay.test.user,
        pass: envConfig().database.postgres.gameplay.test.pass,
        dbName: envConfig().database.postgres.gameplay.test.dbName
    })
}

const bootstrap = async () => {
    const logger = new Logger("SeedData")
    logger.log("Migration started")
    const app = await NestFactory.createApplicationContext(AppModule)

    await app.init()
    logger.log("Migration finished")
    await app.close()
}

Promise.all([createGamplayPostgresqlDatabase(), createTestGamplayPostgresqlDatabase()]).then(() =>
    bootstrap()
)
