import { DynamicModule, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PostgreSQLOptionsFactory, PostgreSQLOptionsModule } from "./options"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql.module-definition"
import { getPostgresEntities, getPostgreSqlDataSourceName } from "./postgresql.utils"
import { PostgreSQLContext, PostgreSQLDatabase } from "@src/env"

@Module({})
export class PostgreSQLModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.forRoot(options)
        const dataSourceName = getPostgreSqlDataSourceName(options)

        options.context = options.context || PostgreSQLContext.Main
        options.database = options.database || PostgreSQLDatabase.Gameplay
        
        return {
            ...dynamicModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [
                        PostgreSQLOptionsModule.register({
                            options
                        })
                    ],
                    inject: [PostgreSQLOptionsFactory],
                    name: dataSourceName,
                    useFactory: async (postgreSQLOptionsFactory: PostgreSQLOptionsFactory) =>
                        postgreSQLOptionsFactory.createTypeOrmOptions()
                }),
                this.forFeature(options)
            ]
        }
    }

    private static forFeature(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dataSourceName = getPostgreSqlDataSourceName(options)
        return {
            module: PostgreSQLModule,
            imports: [TypeOrmModule.forFeature(getPostgresEntities(options.database), dataSourceName)]
        }
    }
}
