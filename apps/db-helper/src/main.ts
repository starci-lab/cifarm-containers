import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DataSource } from "typeorm"
import { Logger } from "@nestjs/common"

const createPostgresqlDatabase = async () => {
    const postgres = new DataSource({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "Cuong123_A"
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
createPostgresqlDatabase().then(() => bootstrap())
