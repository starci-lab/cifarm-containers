import { Module } from "@nestjs/common"
import { GameplayPostgreSQLService } from "./gameplay-postgresql.service"
import { GameplayPostgreSQLOptions, GameplayPostgreSQLType } from "./gameplay-postgresql.types"
import { TypeORMConfig } from "@src/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { gameplayPostgreSqlEntites } from "./entities"
import { envConfig } from "@src/env"

@Module({
    imports: [
        
    ],
    controllers: [],
    providers: [
        GameplayPostgreSQLService
    ]
})
export class GameplayPostgreSQLModule {
    public static forRoot(options: GameplayPostgreSQLOptions = {}) {
        const map: Record<GameplayPostgreSQLType, TypeORMConfig> = {
            [GameplayPostgreSQLType.Main]: {
                host: envConfig().database.postgresql.gameplay.main.host,
                port: envConfig().database.postgresql.gameplay.main.port,
                username: envConfig().database.postgresql.gameplay.main.username,
                password: envConfig().database.postgresql.gameplay.main.password,
                database: envConfig().database.postgresql.gameplay.main.dbName,
            },
            [GameplayPostgreSQLType.Test]: {
                host: envConfig().database.postgresql.gameplay.test.host,
                port: envConfig().database.postgresql.gameplay.test.port,
                username: envConfig().database.postgresql.gameplay.test.username,
                password: envConfig().database.postgresql.gameplay.test.password,
                database: envConfig().database.postgresql.gameplay.test.dbName,
            }
        }
        return {
            module: GameplayPostgreSQLModule,
            imports: [
                TypeOrmModule.forRoot({
                    type: "postgres",
                    ...map[options.type || GameplayPostgreSQLType.Main],
                    entities: gameplayPostgreSqlEntites(),
                    synchronize: true,
                    poolSize: 10000,
                    connectTimeoutMS: 5000,
                }),
                TypeOrmModule.forFeature(gameplayPostgreSqlEntites())
            ],
            providers: [
                GameplayPostgreSQLService
            ],
            exports: [GameplayPostgreSQLService],
        }
    }
}
