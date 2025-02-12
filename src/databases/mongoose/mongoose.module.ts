import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./mongoose.module-definition"
import { envConfig, MongoDbDatabase } from "@src/env"
import { getMongooseConnectionName } from "./utils"
import { MongooseModule as NestMongooseModule } from "@nestjs/mongoose"
import { AnimalSchema, AnimalSchemaClass, BuildingSchema, BuildingSchemaClass, CropSchema, CropSchemaClass } from "./gameplay"

@Module({})
export class MongooseModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.forRoot(options)

        options.database = options.database || MongoDbDatabase.Gameplay
        const connectionName = getMongooseConnectionName(options)

        const { dbName, host, password, port, username } =
            envConfig().databases.mongo[MongoDbDatabase.Gameplay]
        const url = `mongodb://${username}:${password}@${host}:${port}/${dbName}`

        return {
            ...dynamicModule,
            imports: [
                NestMongooseModule.forRoot(url, {
                    connectionName
                }),
                this.forFeature(options)
            ]
        }
    }

    private static forFeature(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const connectionName = getMongooseConnectionName(options)
        return {
            module: MongooseModule,
            imports: [
                NestMongooseModule.forFeature(
                    [
                        {
                            name: AnimalSchema.name,
                            schema: AnimalSchemaClass
                        },
                        {
                            name: BuildingSchema.name,
                            schema: BuildingSchemaClass
                        },
                        {
                            name: CropSchema.name,
                            schema: CropSchemaClass
                        }
                    ],
                    connectionName
                )
            ]
        }
    }
}
