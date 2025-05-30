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
                growthStageDuration: 240,
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
                price: 50,
                growthStageDuration: 600,
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
                growthStageDuration: 900,
                unlockLevel: 3,
                basicHarvestExperiences: 11,
                qualityHarvestExperiences: 22,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Pineapple),
                displayId: CropId.Pineapple,
                price: 120,
                growthStageDuration: 1200,
                unlockLevel: 4,
                basicHarvestExperiences: 13,
                qualityHarvestExperiences: 26,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Watermelon),
                displayId: CropId.Watermelon,
                price: 120,
                growthStageDuration: 1500,
                unlockLevel: 5,
                basicHarvestExperiences: 15,
                qualityHarvestExperiences: 30,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Cucumber),
                displayId: CropId.Cucumber,
                price: 120,
                growthStageDuration: 2000,
                unlockLevel: 6,
                basicHarvestExperiences: 17,
                qualityHarvestExperiences: 34,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.BellPepper),
                displayId: CropId.BellPepper,
                price: 150,
                growthStageDuration: 1200,
                unlockLevel: 7,
                basicHarvestExperiences: 12,
                qualityHarvestExperiences: 24,
                harvestQuantity: 10,
                perennialCount: 3,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Strawberry),
                displayId: CropId.Strawberry,
                price: 130,
                growthStageDuration: 1600,
                unlockLevel: 8,
                basicHarvestExperiences: 10,
                qualityHarvestExperiences: 20,
                harvestQuantity: 16,
                perennialCount: 2,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Pumpkin),
                displayId: CropId.Pumpkin,
                price: 150,
                growthStageDuration: 3000,
                unlockLevel: 9,
                basicHarvestExperiences: 20,
                qualityHarvestExperiences: 40,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Cauliflower),
                displayId: CropId.Cauliflower,
                price: 150,
                growthStageDuration: 3200,
                unlockLevel: 10,
                basicHarvestExperiences: 18,
                qualityHarvestExperiences: 36,
                harvestQuantity: 20,
                perennialCount: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Tomato),
                displayId: CropId.Tomato,
                price: 150,
                growthStageDuration: 4800,
                unlockLevel: 11,
                basicHarvestExperiences: 14,
                qualityHarvestExperiences: 28,
                harvestQuantity: 16,
                perennialCount: 2,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Eggplant),
                displayId: CropId.Eggplant,
                price: 150,
                growthStageDuration: 6000,
                unlockLevel: 12,
                basicHarvestExperiences: 16,
                qualityHarvestExperiences: 32,
                harvestQuantity: 16,
                perennialCount: 2,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Pea),
                displayId: CropId.Pea,
                price: 150,
                growthStageDuration: 7200,
                unlockLevel: 13,
                basicHarvestExperiences: 18,
                qualityHarvestExperiences: 36,
                harvestQuantity: 16,
                perennialCount: 2,
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