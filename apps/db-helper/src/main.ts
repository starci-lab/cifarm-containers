import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DataSource } from "typeorm"
import { Logger } from "@nestjs/common"
import { envConfig } from "@src/config"

const createGamplayPostgresqlDatabase = async () => {
    const postgres = new DataSource({
        type: "postgres",
        host: envConfig().database.postgres.gameplay.host,
        port: envConfig().database.postgres.gameplay.port,
        username: envConfig().database.postgres.gameplay.user,
        password: envConfig().database.postgres.gameplay.pass
    })
    const dataSource = await postgres.initialize()
    await dataSource.createQueryRunner().createDatabase("cifarm", true)
}

const bootstrap = async () => {
    const logger = new Logger("DbHelper")
    const app = await NestFactory.createApplicationContext(AppModule)
    logger.log("Migration started")
    await app.init()
    logger.log("Migration finished")
    await app.close()
}
createGamplayPostgresqlDatabase().then(() => bootstrap())
