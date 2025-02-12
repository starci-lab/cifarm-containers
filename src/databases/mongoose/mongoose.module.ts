import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./mongoose.module-definition"
import { envConfig, MongoDbDatabase } from "@src/env"
import { getMongooseConnectionName } from "./utils"
import { MongooseModule as NestMongooseModule } from "@nestjs/mongoose"
import { AnimalSchema, AnimalSchemaClass, BuildingSchema, BuildingSchemaClass, CropSchema, CropSchemaClass, InventoryTypeSchema, InventoryTypeSchemaClass, SpinPrizeSchema, SpinPrizeSchemaClass, SpinSlotSchema, SpinSlotSchemaClass, SupplySchema, SupplySchemaClass, SystemSchema, SystemSchemaClass, UserSchema } from "./gameplay"
import { InventorySchema } from "./gameplay/schemas/inventory.schema"

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
                        },
                        {
                            name: SystemSchema.name,
                            schema: SystemSchemaClass
                        },
                        {
                            name: InventoryTypeSchema.name,
                            schema: InventoryTypeSchemaClass
                        },
                        {
                            name: SpinPrizeSchema.name,
                            schema: SpinPrizeSchemaClass
                        },
                        {
                            name: SpinSlotSchema.name,
                            schema: SpinSlotSchemaClass
                        },
                        {
                            name: SupplySchema.name,
                            schema: SupplySchemaClass
                        },
                        {
                            name: UserSchema.name,
                            schema: UserSchema
                        },
                        {
                            name: InventorySchema.name,
                            schema: InventorySchema
                        }
                    ],
                    connectionName
                )
            ]
        }
    }
}
