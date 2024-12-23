/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicModule, Global, Module } from "@nestjs/common"
import { SeedCommand } from "./seed.command"
import { createDatabase, runInKubernetes } from "@src/utils"
import { envConfig } from "@src/config"
import { TypeOrmDbType, typeOrmForFeature, typeOrmForRoot } from "@src/dynamic-modules"

@Global()
@Module({})
export class SeedModule {
    static async forRootAsync(): Promise<DynamicModule> {
        let imports: () => Array<DynamicModule>
        if (!runInKubernetes()) {
            await createDatabase({
                host: envConfig().database.postgres.gameplay.main.host,
                port: envConfig().database.postgres.gameplay.main.port,
                user: envConfig().database.postgres.gameplay.main.user,
                pass: envConfig().database.postgres.gameplay.main.pass,
                dbName: envConfig().database.postgres.gameplay.main.dbName
            })
            await createDatabase({
                host: envConfig().database.postgres.gameplay.test.host,
                port: envConfig().database.postgres.gameplay.test.port,
                user: envConfig().database.postgres.gameplay.test.user,
                pass: envConfig().database.postgres.gameplay.test.pass,
                dbName: envConfig().database.postgres.gameplay.test.dbName
            })

            imports = () => ([
                typeOrmForRoot({ type: TypeOrmDbType.Main }),
                typeOrmForFeature({ type: TypeOrmDbType.Main }),
                typeOrmForRoot({ type: TypeOrmDbType.Test }),
                typeOrmForFeature({ type: TypeOrmDbType.Test })
            ])
        } else {
            imports = () => ([
                typeOrmForRoot({ type: TypeOrmDbType.Main }),
                typeOrmForFeature({ type: TypeOrmDbType.Main }),
            ])
        }
        return {
            module: SeedModule,
            imports: imports(),
            providers: [
                SeedCommand
            ],
            exports: [SeedCommand]
        }
    }
}
