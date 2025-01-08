import { DynamicModule, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { gameplayPostgreSqlEntities } from "./gameplay/entities"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql.module-definition"
import { getPostgreSqlDataSourceName } from "./postgresql.utils"
import { PostgreSQLOptionsModule } from "./postgresql-options.module"
import { PostgreSQLOptionsFactory } from "./postgresql.options-factory"

@Module({})
export class PostgreSQLModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.forRoot(options)
        const dataSourceName = getPostgreSqlDataSourceName(options)
        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers],
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [PostgreSQLOptionsModule.forRoot(options)],
                    inject: [PostgreSQLOptionsFactory],
                    name: dataSourceName,
                    useFactory: (postgreSQLOptionsFactory: PostgreSQLOptionsFactory) =>
                        postgreSQLOptionsFactory.createTypeOrmOptions()
                }),
                TypeOrmModule.forFeature(gameplayPostgreSqlEntities(), dataSourceName)
            ]
        }
    }
}
