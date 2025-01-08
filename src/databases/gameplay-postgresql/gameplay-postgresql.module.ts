import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, isProduction } from "@src/env"
import { gameplayPostgreSqlEntities } from "./entities"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./gameplay-postgresql.module-definition"
import { DatabaseContext } from "../databases.types"
import { CONNECTION_TIMEOUT_MS, POOL_SIZE } from "./gameplay-postgresql.constants"

@Module({})
export class GameplayPostgreSQLModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}) {
        const context = options.context ?? DatabaseContext.Main
        return {
            module: GameplayPostgreSQLModule,
            //forRootAsync()
            imports: [
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().databases.postgresql.gameplay[context].host,
                    port: envConfig().databases.postgresql.gameplay[context].port,
                    username: envConfig().databases.postgresql.gameplay[context].username,
                    password: envConfig().databases.postgresql.gameplay[context].password,
                    database: envConfig().databases.postgresql.gameplay[context].dbName,
                    entities: gameplayPostgreSqlEntities(),
                    synchronize: !isProduction(),
                    connectTimeoutMS: CONNECTION_TIMEOUT_MS,
                    poolSize: POOL_SIZE,
                }),
                TypeOrmModule.forFeature(gameplayPostgreSqlEntities())
            ]
        }
    }
}
