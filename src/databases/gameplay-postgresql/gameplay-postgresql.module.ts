import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TypeORMConfig } from "@src/common"
import { envConfig, redisClusterRunInDocker, RedisType } from "@src/env"
import { gameplayPostgreSqlEntites } from "./entities"
import { GameplayPostgreSQLService } from "./gameplay-postgresql.service"
import { GameplayPostgreSQLOptions, GameplayPostgreSQLType } from "./gameplay-postgresql.types"
import {
    ChildProcessDockerRedisClusterModule,
    ChildProcessDockerRedisClusterService
} from "@src/child-process"
import { NatMap } from "ioredis"
import { DbCacheManager } from "@src/cache"

@Module({})
export class GameplayPostgreSQLModule {
    public static forRoot(options: GameplayPostgreSQLOptions = {}) {
        const map: Record<GameplayPostgreSQLType, TypeORMConfig> = {
            [GameplayPostgreSQLType.Main]: {
                host: envConfig().databases.postgresql.gameplay.main.host,
                port: envConfig().databases.postgresql.gameplay.main.port,
                username: envConfig().databases.postgresql.gameplay.main.username,
                password: envConfig().databases.postgresql.gameplay.main.password,
                database: envConfig().databases.postgresql.gameplay.main.dbName
            },
            [GameplayPostgreSQLType.Test]: {
                host: envConfig().databases.postgresql.gameplay.test.host,
                port: envConfig().databases.postgresql.gameplay.test.port,
                username: envConfig().databases.postgresql.gameplay.test.username,
                password: envConfig().databases.postgresql.gameplay.test.password,
                database: envConfig().databases.postgresql.gameplay.test.dbName
            }
        }

        return {
            module: GameplayPostgreSQLModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [
                        ChildProcessDockerRedisClusterModule.forRoot({
                            type: RedisType.Cache
                        })
                    ],
                    inject: [ChildProcessDockerRedisClusterService],
                    useFactory: async (service: ChildProcessDockerRedisClusterService) => {
                        let natMap: NatMap
                        if (redisClusterRunInDocker()) {
                            natMap = await service.getNatMap()
                        }

                        return {
                            type: "postgres",
                            ...map[options.type || GameplayPostgreSQLType.Main],
                            entities: gameplayPostgreSqlEntites(),
                            synchronize: true,
                            poolSize: 10000,
                            connectTimeoutMS: 5000,
                            cache: new DbCacheManager().createCacheOptions({ natMap})
                        }
                    }
                }),
            ],
        }
    }

    public static forFeature(){
        return {
            module: GameplayPostgreSQLModule,
            imports: [
                TypeOrmModule.forFeature(gameplayPostgreSqlEntites())
            ],
            providers: [GameplayPostgreSQLService],
            exports: [GameplayPostgreSQLService]
        }
    }
}
