import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import {
    AnimalSchema,
    BuildingSchema,
    CropSchema,
    DefaultInfo,
    InjectMongoose,
    KeyValueRecord,
    PlacedItemTypeSchema,
    SystemId,
    SystemSchema,
    InventoryTypeSchema,
    ProductSchema,
    PetSchema,
    FruitSchema,
    SupplySchema,
    ToolSchema,
    TileSchema,
    Activities,
    CropRandomness,
    AnimalRandomness,
    FruitRandomness,
    SpinInfo,
    EnergyRegen,
    DailyRewardInfo,
    HoneycombInfo
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
@Injectable()
export class StaticService implements OnModuleInit {
    private readonly logger = new Logger(StaticService.name)

    public defaultInfo: DefaultInfo
    public activities: Activities
    public cropRandomness: CropRandomness
    public animalRandomness: AnimalRandomness
    public fruitRandomness: FruitRandomness
    public spinInfo: SpinInfo
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

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async onModuleInit() {
        // Load system values
        const defaultInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
        this.defaultInfo = defaultInfoDoc.value

        const activitiesDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<Activities>>(createObjectId(SystemId.Activities))
        this.activities = activitiesDoc.value

        const cropRandomnessDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<CropRandomness>>(createObjectId(SystemId.CropRandomness))
        this.cropRandomness = cropRandomnessDoc.value

        const animalRandomnessDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<AnimalRandomness>>(createObjectId(SystemId.AnimalRandomness))
        this.animalRandomness = animalRandomnessDoc.value

        const fruitRandomnessDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<FruitRandomness>>(createObjectId(SystemId.FruitRandomness))
        this.fruitRandomness = fruitRandomnessDoc.value

        const spinInfoDoc = await this.connection
            .model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<SpinInfo>>(createObjectId(SystemId.SpinInfo))
        this.spinInfo = spinInfoDoc.value

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

        this.logger.log("All static data loaded")
        this.logger.log("System data: 9") // hardcoded
        this.logger.log(`Animals: ${this.animals.length}`)
        this.logger.log(`Crops: ${this.crops.length}`)
        this.logger.log(`Buildings: ${this.buildings.length}`)
        this.logger.log(`Inventory types: ${this.inventoryTypes.length}`)
        this.logger.log(`Products: ${this.products.length}`)
        this.logger.log(`Pets: ${this.pets.length}`)
        this.logger.log(`Fruits: ${this.fruits.length}`)
        this.logger.log(`Supplies: ${this.supplies.length}`)
    }
}
