import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./memory.module-definition"
import { PostgreSQLDatabase } from "@src/env"
import { getPostgresEntities, getPostgreSqlDataSourceName } from "../postgresql.utils"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PostgreSQLMemoryCoreModule } from "./memory-core.module"

@Module({})
export class PostgreSQLMemoryModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        options.database = options.database || PostgreSQLDatabase.Gameplay
        return {
            ...dynamicModule,
            imports: [PostgreSQLMemoryCoreModule.register(options), this.forFeature(options)],
        }
    }

    private static forFeature(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dataSourceName = getPostgreSqlDataSourceName(options)
        return {
            module: PostgreSQLMemoryModule,
            imports: [
                TypeOrmModule.forFeature(getPostgresEntities(options.database), dataSourceName)
            ]
        }
    }
}
