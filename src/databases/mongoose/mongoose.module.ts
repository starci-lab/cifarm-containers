import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./mongoose.module-definition"
import { envConfig, MongoDatabase } from "@src/env"
import { getMongooseConnectionName, getMongooseToken } from "./utils"
import { MongooseModule as NestMongooseModule } from "@nestjs/mongoose"
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
    SystemSchema,
    SystemSchemaClass,
    TileSchema,
    TileSchemaClass,
    UserSchema,
    PlacedItemTypeSchema,
    PlacedItemTypeSchemaClass,
    PlacedItemSchema,
    PlacedItemSchemaClass,
    SessionSchema,
    SessionSchemaClass,
    SeedGrowthInfoSchemaClass,
    SeedGrowthInfoSchema,
    TileInfoSchema, 
    TileInfoSchemaClass,
    AnimalInfoSchema,
    AnimalInfoSchemaClass,
    BuildingInfoSchema,
    BuildingInfoSchemaClass,
    UpgradeSchema,
    UpgradeSchemaClass,
    ProductSchema,
    ProductSchemaClass,
    InventorySchema, 
    InventorySchemaClass, 
    KeyValueStoreSchema,
    KeyValueStoreSchemaClass,
    SupplySchema,
    SupplySchemaClass,
    ToolSchema,
    ToolSchemaClass,
    UserFollowRelationSchemaClass,
    UserFollowRelationSchema,
    PetSchema,
    PetSchemaClass,
    FruitSchemaClass,
    FruitSchema
} from "./gameplay"
import { Connection } from "mongoose"
import { normalizeMongoose } from "./plugins"

@Module({})
export class MongooseModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.forRoot(options)

        options.database = options.database || MongoDatabase.Gameplay
        const connectionName = getMongooseConnectionName(options)

        const { dbName, host, password, port, username } =
            envConfig().databases.mongo[MongoDatabase.Gameplay]
        const url = `mongodb://${username}:${password}@${host}:${port}`

        return {
            ...dynamicModule,
            imports: [
                NestMongooseModule.forRoot(url, {
                    connectionName,
                    retryWrites: true,
                    retryReads: true,
                    authSource: "admin",
                    dbName,
                    connectionFactory: async (connection: Connection) => {
                        connection.plugin(normalizeMongoose)
                        return connection
                    }, 
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
                            name: UpgradeSchema.name,
                            useFactory: () => UpgradeSchemaClass
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
                            name: UserFollowRelationSchema.name,
                            useFactory: () => UserFollowRelationSchemaClass
                        },
                        {
                            name: PetSchema.name,
                            useFactory: () => PetSchemaClass
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
                            name: InventorySchema.name,
                            useFactory: () => InventorySchemaClass
                        },
                        {
                            name: ToolSchema.name,
                            useFactory: () => ToolSchemaClass
                        },
                        {
                            name: FruitSchema.name,
                            useFactory: () => FruitSchemaClass
                        }
                        ,{
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
                                    await connection.model<PlacedItemSchema>(PlacedItemSchema.name).deleteMany({
                                        user: { $in: ids }
                                    })
                                    await connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                                        user: { $in: ids }
                                    })
                                    await connection.model<UserFollowRelationSchema>(UserFollowRelationSchema.name).deleteMany({
                                        $or: [
                                            { followee: { $in: ids } },
                                            { follower: { $in: ids } }
                                        ]
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
                            name: TileSchema.name,
                            useFactory: () => TileSchemaClass
                        },
                        {
                            name: PlacedItemTypeSchema.name,
                            useFactory: () => PlacedItemTypeSchemaClass
                        },
                        {
                            name: SeedGrowthInfoSchema.name,
                            useFactory: () => SeedGrowthInfoSchemaClass
                        },
                        {
                            name: TileInfoSchema.name,
                            useFactory: () => TileInfoSchemaClass
                        },
                        {
                            name: AnimalInfoSchema.name,
                            useFactory: () => AnimalInfoSchemaClass
                        },
                        {
                            name: BuildingInfoSchema.name,
                            useFactory: () => BuildingInfoSchemaClass
                        },
                        {
                            name: PlacedItemSchema.name,
                            useFactory: () => PlacedItemSchemaClass
                        },
                        {
                            name: ProductSchema.name,
                            useFactory: () => ProductSchemaClass
                        },
                        {
                            name: KeyValueStoreSchema.name,
                            useFactory: () => KeyValueStoreSchemaClass
                        }
                    ],
                    connectionName
                )
            ]
        }
    }
}
