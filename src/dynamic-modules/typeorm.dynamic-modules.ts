import { DynamicModule } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import {
    gameplayEntites
} from "@src/database"

export enum TypeOrmDbType {
    Main,
    Test
}

export interface TypeORMConfig {
    host: string
    port: number
    username: string
    password: string
    database: string
    name?: string
}

export const TEST_DATASOURCE_NAME = "test"

export interface TypeOrmModuleForRootParams {
    type?: TypeOrmDbType
}

export const typeOrmForRoot = ({ type }: TypeOrmModuleForRootParams = {}): DynamicModule => {
    const map: Record<TypeOrmDbType, TypeORMConfig> = {
        [TypeOrmDbType.Main]: {
            host: envConfig().database.postgresql.gameplay.main.host,
            port: envConfig().database.postgresql.gameplay.main.port,
            username: envConfig().database.postgresql.gameplay.main.username,
            password: envConfig().database.postgresql.gameplay.main.password,
            database: envConfig().database.postgresql.gameplay.main.dbName,
        },
        [TypeOrmDbType.Test]: {
            host: envConfig().database.postgresql.gameplay.test.host,
            port: envConfig().database.postgresql.gameplay.test.port,
            username: envConfig().database.postgresql.gameplay.test.username,
            password: envConfig().database.postgresql.gameplay.test.password,
            database: envConfig().database.postgresql.gameplay.test.dbName,
            name: TEST_DATASOURCE_NAME
        }
    }

    return TypeOrmModule.forRoot({
        type: "postgres",
        ...map[type || TypeOrmDbType.Main],
        autoLoadEntities: true,
        synchronize: true,
        poolSize: 10000,
        connectTimeoutMS: 5000,
    })
}

export interface TypeOrmModuleForFeatureParams {
    type?: TypeOrmDbType
}

export const typeOrmForFeature = ({ type }: TypeOrmModuleForFeatureParams = {}): DynamicModule => {
    const map: Record<TypeOrmDbType, string> = {
        [TypeOrmDbType.Main]: undefined,
        [TypeOrmDbType.Test]: TEST_DATASOURCE_NAME
    }

    return TypeOrmModule.forFeature(
        gameplayEntites(),
        map[type || TypeOrmDbType.Main]
    )
}