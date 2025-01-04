import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TypeORMConfig } from "@src/common"
import { envConfig, isRedisClusterEnabled, RedisClusterType } from "@src/env"
import { createCacheOptions } from "../utils"
import { gameplayPostgreSqlEntites } from "./entities"
import { GameplayPostgreSQLService } from "./gameplay-postgresql.service"
import { GameplayPostgreSQLOptions, GameplayPostgreSQLType } from "./gameplay-postgresql.types"

@Module({
    imports: [
        
    ],
    controllers: [],
    providers: [
        GameplayPostgreSQLService
    ]
})
export class GameplayPostgreSQLModule {
    public static forRoot(options: GameplayPostgreSQLOptions = {
        cache: false
    }) {
        const map: Record<GameplayPostgreSQLType, TypeORMConfig> = {
            [GameplayPostgreSQLType.Main]: {
                host: envConfig().databases.postgresql.gameplay.main.host,
                port: envConfig().databases.postgresql.gameplay.main.port,
                username: envConfig().databases.postgresql.gameplay.main.username,
                password: envConfig().databases.postgresql.gameplay.main.password,
                database: envConfig().databases.postgresql.gameplay.main.dbName,
            },
            [GameplayPostgreSQLType.Test]: {
                host: envConfig().databases.postgresql.gameplay.test.host,
                port: envConfig().databases.postgresql.gameplay.test.port,
                username: envConfig().databases.postgresql.gameplay.test.username,
                password: envConfig().databases.postgresql.gameplay.test.password,
                database: envConfig().databases.postgresql.gameplay.test.dbName,
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
                    cache: createCacheOptions(isRedisClusterEnabled(RedisClusterType.Cache))
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
