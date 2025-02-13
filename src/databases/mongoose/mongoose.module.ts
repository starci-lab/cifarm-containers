import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./mongoose.module-definition"
import { envConfig, MongoDbDatabase } from "@src/env"
import { getMongooseConnectionName, getMongooseToken } from "./utils"
import { MongooseModule as NestMongooseModule } from "@nestjs/mongoose"
import { InventorySchema, InventorySchemaClass } from "./gameplay/schemas/inventory.schema"
import {
    AnimalSchema,
    AnimalSchemaClass,
    BuildingSchema,
    BuildingSchemaClass,
    UserSchemaClass,
    CropSchema,
    CropSchemaClass,
    InventoryTypeSchema,
    InventoryTypeSchemaClass,
    SpinPrizeSchema,
    SpinPrizeSchemaClass,
    SpinSlotSchema,
    SpinSlotSchemaClass,
    SupplySchema,
    SupplySchemaClass,
    SystemSchema,
    SystemSchemaClass,
    TileSchema,
    TileSchemaClass,
    ToolSchema,
    ToolSchemaClass,
    UserSchema,
    PlacedItemTypeSchema,
    PlacedItemTypeSchemaClass,
    PlacedItemSchema,
    PlacedItemSchemaClass,
    SessionSchema,
    SessionSchemaClass
} from "./gameplay"
import { Connection } from "mongoose"

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
                    connectionName,
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
                NestMongooseModule.forFeatureAsync(
                    [
                        {
                            name: AnimalSchema.name,
                            useFactory: () => AnimalSchemaClass
                        },
                        {
                            name: BuildingSchema.name,
                            useFactory: () => BuildingSchemaClass
                        },
                        {
                            name: CropSchema.name,
                            useFactory: () => CropSchemaClass
                        },
                        {
                            name: SystemSchema.name,
                            useFactory: () => SystemSchemaClass
                        },
                        {
                            name: InventoryTypeSchema.name,
                            useFactory: () => InventoryTypeSchemaClass
                        },
                        {
                            name: SpinPrizeSchema.name,
                            useFactory: () => SpinPrizeSchemaClass
                        },
                        {
                            name: SpinSlotSchema.name,
                            useFactory: () => SpinSlotSchemaClass
                        },
                        {
                            name: SupplySchema.name,
                            useFactory: () => SupplySchemaClass
                        },
                        {
                            name: UserSchema.name,
                            inject: [getMongooseToken(options)],
                            useFactory: (
                                connection: Connection
                            ) => {
                                UserSchemaClass.pre("deleteMany", async function (next) {
                                    // delete all related data in session collection
                                    const { $in } = this.getFilter()._id
                                    const ids = $in
                                    await connection.model<SessionSchema>(SessionSchema.name).deleteMany({
                                        user: { $in: ids }
                                    })
                                    next()
                                })
                                return UserSchemaClass
                            }
                        },
                        {
                            name: SessionSchema.name,
                            useFactory: () => SessionSchemaClass
                        },
                        {
                            name: InventorySchema.name,
                            useFactory: () => InventorySchemaClass
                        },
                        {
                            name: ToolSchema.name,
                            useFactory: () => ToolSchemaClass
                        },
                        {
                            name: TileSchema.name,
                            useFactory: () => TileSchemaClass
                        },
                        {
                            name: PlacedItemTypeSchema.name,
                            useFactory: () => PlacedItemTypeSchemaClass
                        },
                        {
                            name: PlacedItemSchema.name,
                            useFactory: () => PlacedItemSchemaClass
                        }
                    ],
                    connectionName
                )
            ]
        }
    }
}
