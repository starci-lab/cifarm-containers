import { DynamicModule, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PostgreSQLOptionsFactory } from "./postgresql-options.factory"
import { PostgreSQLOptionsModule } from "./postgresql-options.module"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql.module-definition"
import { PostgreSQLOptions } from "./postgresql.types"
import { getPostgresEntities, getPostgreSqlDataSourceName } from "./postgresql.utils"

@Module({})
export class PostgreSQLModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.forRoot(options)
        const dataSourceName = getPostgreSqlDataSourceName(options)
        
        return {
            ...dynamicModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [PostgreSQLOptionsModule.register(options)],
                    inject: [PostgreSQLOptionsFactory],
                    name: dataSourceName,
                    useFactory: (postgreSQLOptionsFactory: PostgreSQLOptionsFactory) =>
                        postgreSQLOptionsFactory.createTypeOrmOptions()
                }),
                this.forFeature(options)
            ],
        }
    }

    private static forFeature(options: PostgreSQLOptions): DynamicModule {
        const dataSourceName = getPostgreSqlDataSourceName(options)
        return {
            module: PostgreSQLModule,
            imports: [
                TypeOrmModule.forFeature(
                    getPostgresEntities(options),
                    dataSourceName
                )
            ],
        }
    }
}
