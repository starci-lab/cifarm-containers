import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    CropId,
    CropSchema,
    InjectMongoose,
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class CropSeeder implements Seeder {
    private readonly logger = new Logger(CropSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        this.logger.debug("Seeding crops...")
        const data: Array<Partial<CropSchema>> = [
            {
                _id: createObjectId(CropId.Turnip),
                displayId: CropId.Turnip,
                price: 50,
                growthStageDuration: 60,
                unlockLevel: 1,
                basicHarvestExperiences: 4,
                qualityHarvestExperiences: 8,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Carrot),
                displayId: CropId.Carrot,
                price: 75,
                growthStageDuration: 90,
                unlockLevel: 2,
                basicHarvestExperiences: 6,
                qualityHarvestExperiences: 12,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Potato),
                displayId: CropId.Potato,
                price: 100,
                growthStageDuration: 120,
                unlockLevel: 3,
                basicHarvestExperiences: 8,
                qualityHarvestExperiences: 16,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Pineapple),
                displayId: CropId.Pineapple,
                price: 125,
                growthStageDuration: 720,
                unlockLevel: 5,
                basicHarvestExperiences: 8,
                qualityHarvestExperiences: 16,
                harvestQuantity: 12,
                perennialCount: 3,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Watermelon),
                displayId: CropId.Watermelon,
                price: 125,
                growthStageDuration: 840,
                unlockLevel: 5,
                basicHarvestExperiences: 16,
                qualityHarvestExperiences: 32,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Cucumber),
                displayId: CropId.Cucumber,
                price: 150,
                growthStageDuration: 1440,
                unlockLevel: 7,
                basicHarvestExperiences: 12,
                qualityHarvestExperiences: 24,
                harvestQuantity: 12,
                perennialCount: 3,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.BellPepper),
                displayId: CropId.BellPepper,
                price: 175,
                growthStageDuration: 2160,
                unlockLevel: 9,
                basicHarvestExperiences: 16,
                qualityHarvestExperiences: 32,
                harvestQuantity: 12,
                perennialCount: 3,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Strawberry),
                displayId: CropId.Strawberry,
                price: 200,
                growthStageDuration: 2160,
                unlockLevel: 12,
                basicHarvestExperiences: 20,
                qualityHarvestExperiences: 40,
                harvestQuantity: 12,
                perennialCount: 3,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Pumpkin),
                displayId: CropId.Pumpkin,
                price: 200,
                growthStageDuration: 2520,
                unlockLevel: 12,
                basicHarvestExperiences: 40,
                qualityHarvestExperiences: 80,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Cauliflower),
                displayId: CropId.Cauliflower,
                price: 225,
                growthStageDuration: 4320,
                unlockLevel: 15,
                basicHarvestExperiences: 54,
                qualityHarvestExperiences: 108,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Tomato),
                displayId: CropId.Tomato,
                price: 250,
                growthStageDuration: 3240,
                unlockLevel: 18,
                basicHarvestExperiences: 36,
                qualityHarvestExperiences: 72,
                harvestQuantity: 12,
                perennialCount: 3,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Eggplant),
                displayId: CropId.Eggplant,
                price: 250,
                growthStageDuration: 3240,
                unlockLevel: 18,
                basicHarvestExperiences: 36,
                qualityHarvestExperiences: 72,
                harvestQuantity: 12,
                perennialCount: 3,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Pea),
                displayId: CropId.Pea,
                price: 275,
                growthStageDuration: 8640,
                unlockLevel: 20,
                basicHarvestExperiences: 54,
                qualityHarvestExperiences: 108,
                harvestQuantity: 12,
                perennialCount: 3,
                availableInShop: true,
            }
        ]

        await this.connection.model<CropSchema>(CropSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping crops...")
        await this.connection.model<CropSchema>(CropSchema.name).deleteMany({})
    }
}