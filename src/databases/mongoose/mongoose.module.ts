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
    DecorationSchema,
    DecorationSchemaClass,
    PlantInfoSchema,
    PlantInfoSchemaClass,
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
    PetSchema,
    PetSchemaClass,
    FruitSchemaClass,
    FruitSchema,
    BeeHouseInfoSchema,
    BeeHouseInfoSchemaClass,
    FlowerSchema,
    FlowerSchemaClass,
    PetInfoSchema,
    PetInfoSchemaClass,
    NFTItemSchema,
    NFTItemSchemaClass,
    NFTMetadataSchema,
    NFTMetadataSchemaClass,
    NFTIndexSchema,
    NFTIndexSchemaClass,
    FishSchema,
    FishSchemaClass,
    OathProviderSchemaClass,
    OathProviderSchema,
    TerrainSchema,
    TerrainSchemaClass,
    TerrainInfoSchema,
    TerrainInfoSchemaClass,
    TutorialSchema,
    TutorialSchemaClass,
    SeasonSchema,
    SeasonSchemaClass,
    BulkSchema,
    BulkSchemaClass
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
                            name: FlowerSchema.name,
                            useFactory: () => FlowerSchemaClass
                        },
                        {
                            name: BulkSchema.name,
                            useFactory: () => BulkSchemaClass
                        },
                        {
                            name: SeasonSchema.name,
                            useFactory: () => SeasonSchemaClass
                        },
                        {
                            name: PetInfoSchema.name,
                            useFactory: () => PetInfoSchemaClass
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
                            name: PetSchema.name,
                            useFactory: () => PetSchemaClass
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
                        },
                        {
                            name: TutorialSchema.name,
                            useFactory: () => TutorialSchemaClass
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
                                    await connection.model<PlacedItemSchema>(PlacedItemSchema.name).deleteMany({
                                        user: { $in: ids }
                                    })
                                    await connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                                        user: { $in: ids }
                                    })
                                    next()
                                })
                                return UserSchemaClass
                            }
                        },
                        {
                            name: BeeHouseInfoSchema.name,
                            useFactory: () => BeeHouseInfoSchemaClass
                        },
                        {
                            name: DecorationSchema.name,
                            useFactory: () => DecorationSchemaClass
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
                            name: PlantInfoSchema.name,
                            useFactory: () => PlantInfoSchemaClass
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
                        },
                        {
                            name: NFTItemSchema.name,
                            useFactory: () => NFTItemSchemaClass
                        },
                        {
                            name: NFTMetadataSchema.name,
                            useFactory: () => NFTMetadataSchemaClass
                        },
                        {
                            name: NFTIndexSchema.name,
                            useFactory: () => NFTIndexSchemaClass
                        },
                        {
                            name: FishSchema.name,
                            useFactory: () => FishSchemaClass
                        },
                        {
                            name: TerrainInfoSchema.name,
                            useFactory: () => TerrainInfoSchemaClass
                        },
                        {
                            name: OathProviderSchema.name,
                            useFactory: () => OathProviderSchemaClass
                        },
                        {
                            name: TerrainSchema.name,
                            useFactory: () => TerrainSchemaClass
                        }
                    ],
                    connectionName
                )
            ]
        }
    }
}
