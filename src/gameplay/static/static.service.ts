import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    AnimalSchema,
    BuildingSchema,
    CropSchema,
    DefaultInfo,
    PlacedItemTypeSchema,
    InventoryTypeSchema,
    ProductSchema,
    PetSchema,
    FruitSchema,
    SupplySchema,
    ToolSchema,
    TileSchema,
    Activities,
    EnergyRegen,
    DailyRewardInfo,
    HoneycombInfo,
    InjectMongoose,
    KeyValueRecord,
    SystemId,
    SystemSchema,
    FruitInfo,
    AnimalInfo,
    CropInfo,
    FlowerSchema,
    FlowerInfo,
    BeeHouseInfo,
    NFTCollections,
    NFTBoxInfo,
    RevenueRecipients,
    GoldPurchases,
    InteractionPermissions,
    PetInfo,
    Tokens,
    TerrainSchema,
    Referral,
    NFTConversion,
    EnergyPurchases,
    SeasonSchema
} from "@src/databases"
import { Connection } from "mongoose"
@Injectable()
export class StaticService implements OnModuleInit {
    private readonly logger = new Logger(StaticService.name)

    public defaultInfo: DefaultInfo
    public activities: Activities
    public cropInfo: CropInfo
    public animalInfo: AnimalInfo
    public fruitInfo: FruitInfo
    public energyRegen: EnergyRegen
    public dailyRewardInfo: DailyRewardInfo
    public honeycombInfo: HoneycombInfo
    public placedItemTypes: Array<PlacedItemTypeSchema>
    public animals: Array<AnimalSchema>
    public crops: Array<CropSchema>
    public buildings: Array<BuildingSchema>
    public inventoryTypes: Array<InventoryTypeSchema>
    public products: Array<ProductSchema>
    public pets: Array<PetSchema>
    public fruits: Array<FruitSchema>
    public supplies: Array<SupplySchema>
    public tools: Array<ToolSchema>
    public tiles: Array<TileSchema>
    public flowers: Array<FlowerSchema>
    public flowerInfo: FlowerInfo
    public beeHouseInfo: BeeHouseInfo
    public nftCollections: NFTCollections
    public nftBoxInfo: NFTBoxInfo
    public revenueRecipients: RevenueRecipients
    public goldPurchases: GoldPurchases
    public energyPurchases: EnergyPurchases
    public interactionPermissions: InteractionPermissions
    public petInfo: PetInfo
    public tokens: Tokens
    public terrains: Array<TerrainSchema>
    public referral: Referral
    public nftConversion: NFTConversion
    public seasons: Array<SeasonSchema>
    
    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async onModuleInit() {
        await this.load()
    }

    private async load() {
        // Load system values
        const defaultInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
        this.defaultInfo = defaultInfoDoc.value

        const activitiesDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        this.activities = activitiesDoc.value

        const cropInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<CropInfo>>(createObjectId(SystemId.CropInfo))
        this.cropInfo = cropInfoDoc.value

        const animalInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<AnimalInfo>>(createObjectId(SystemId.AnimalInfo))
        this.animalInfo = animalInfoDoc.value

        const fruitInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<FruitInfo>>(createObjectId(SystemId.FruitInfo))
        this.fruitInfo = fruitInfoDoc.value

        const energyRegenDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<EnergyRegen>>(createObjectId(SystemId.EnergyRegen))
        this.energyRegen = energyRegenDoc.value

        const dailyRewardInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<DailyRewardInfo>>(createObjectId(SystemId.DailyRewardInfo))
        this.dailyRewardInfo = dailyRewardInfoDoc.value

        const honeycombInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<HoneycombInfo>>(createObjectId(SystemId.HoneycombInfo))
        this.honeycombInfo = honeycombInfoDoc.value

        const flowerInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<FlowerInfo>>(createObjectId(SystemId.FlowerInfo))
        this.flowerInfo = flowerInfoDoc.value

        const beeHouseInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<BeeHouseInfo>>(createObjectId(SystemId.BeeHouseInfo))
        this.beeHouseInfo = beeHouseInfoDoc.value

        const nftCollectionsDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<NFTCollections>>(createObjectId(SystemId.NFTCollections))
        this.nftCollections = nftCollectionsDoc.value

        const nftBoxInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<NFTBoxInfo>>(createObjectId(SystemId.NFTBoxInfo))
        this.nftBoxInfo = nftBoxInfoDoc.value

        const revenueRecipientsDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<RevenueRecipients>>(createObjectId(SystemId.RevenueRecipients))
        this.revenueRecipients = revenueRecipientsDoc.value

        const goldPurchasesDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<GoldPurchases>>(createObjectId(SystemId.GoldPurchases))
        this.goldPurchases = goldPurchasesDoc.value

        const energyPurchasesDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<EnergyPurchases>>(createObjectId(SystemId.EnergyPurchases))
        this.energyPurchases = energyPurchasesDoc.value

        const interactionPermissionsDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<InteractionPermissions>>(createObjectId(SystemId.InteractionPermissions))
        this.interactionPermissions = interactionPermissionsDoc.value

        const petInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<PetInfo>>(createObjectId(SystemId.PetInfo))
        this.petInfo = petInfoDoc.value

        const tokensDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Tokens>>(createObjectId(SystemId.Tokens))
        this.tokens = tokensDoc.value

        const referralDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Referral>>(createObjectId(SystemId.Referral))
        this.referral = referralDoc.value

        const nftConversionDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<NFTConversion>>(createObjectId(SystemId.NFTConversion))
        this.nftConversion = nftConversionDoc.value
        // Load collections
        this.placedItemTypes = await this.connection
            .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
            .find()

        this.animals = await this.connection.model<AnimalSchema>(AnimalSchema.name).find()

        this.crops = await this.connection.model<CropSchema>(CropSchema.name).find()

        this.buildings = await this.connection.model<BuildingSchema>(BuildingSchema.name).find()

        this.inventoryTypes = await this.connection
            .model<InventoryTypeSchema>(InventoryTypeSchema.name)
            .find()

        this.products = await this.connection.model<ProductSchema>(ProductSchema.name).find()

        this.pets = await this.connection.model<PetSchema>(PetSchema.name).find()

        this.fruits = await this.connection.model<FruitSchema>(FruitSchema.name).find()

        this.supplies = await this.connection.model<SupplySchema>(SupplySchema.name).find()

        this.tools = await this.connection.model<ToolSchema>(ToolSchema.name).find()

        this.tiles = await this.connection.model<TileSchema>(TileSchema.name).find()

        this.flowers = await this.connection.model<FlowerSchema>(FlowerSchema.name).find()

        this.terrains = await this.connection.model<TerrainSchema>(TerrainSchema.name).find()

        this.seasons = await this.connection.model<SeasonSchema>(SeasonSchema.name).find()

        this.logger.verbose("All static data loaded")
        this.logger.verbose(`Animals: ${this.animals.length}`)
        this.logger.verbose(`Crops: ${this.crops.length}`)
        this.logger.verbose(`Buildings: ${this.buildings.length}`)
        this.logger.verbose(`Inventory types: ${this.inventoryTypes.length}`)
        this.logger.verbose(`Products: ${this.products.length}`)
        this.logger.verbose(`Pets: ${this.pets.length}`)
        this.logger.verbose(`Fruits: ${this.fruits.length}`)
        this.logger.verbose(`Supplies: ${this.supplies.length}`)
        this.logger.verbose(`Flowers: ${this.flowers.length}`)
        this.logger.verbose(`Terrains: ${this.terrains.length}`)
        this.logger.verbose(`Seasons: ${this.seasons.length}`)
    }
}