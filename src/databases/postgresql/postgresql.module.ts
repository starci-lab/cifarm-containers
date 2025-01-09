import { DynamicModule, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { gameplayPostgreSqlEntities } from "./gameplay/entities"
import { PostgreSQLOptionsFactory } from "./postgresql-options.factory"
import { PostgreSQLOptionsModule } from "./postgresql-options.module"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql.module-definition"
import { getPostgreSqlDataSourceName } from "./postgresql.utils"

@Module({})
export class PostgreSQLModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.forRoot(options)
        const dataSourceName = getPostgreSqlDataSourceName(options)

        console.log(dynamicModule)
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
                TypeOrmModule.forFeature(gameplayPostgreSqlEntities(), dataSourceName)
            ],
        }
    }
}
