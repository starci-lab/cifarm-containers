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
                _id: createObjectId(CropId.Carrot),
                displayId: CropId.Carrot,
                price: 50,
                growthStageDuration: 3600,
                growthStages: 5,
                unlockLevel: 1,
                basicHarvestExperiences: 12,
                premiumHarvestExperiences: 60,
                minHarvestQuantity: 14,
                maxHarvestQuantity: 20,
                premium: false,
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Potato),
                displayId: CropId.Potato,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                unlockLevel: 3,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Cucumber),
                displayId: CropId.Cucumber,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                unlockLevel: 5,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true
            },
            {
                _id: createObjectId(CropId.Pineapple),
                displayId: CropId.Pineapple,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                unlockLevel: 6,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.Watermelon),
                displayId: CropId.Watermelon,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                unlockLevel: 7,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennialCount: 1,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(CropId.BellPepper),
                displayId: CropId.BellPepper,
                price: 100,
                growthStageDuration: 9000,
                growthStages: 5,
                unlockLevel: 8,
                basicHarvestExperiences: 21,
                premiumHarvestExperiences: 110,
                minHarvestQuantity: 16,
                maxHarvestQuantity: 23,
                premium: false,
                perennialCount: 3,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
            },
        ]

        await this.connection.model<CropSchema>(CropSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping crops...")
        await this.connection.model<CropSchema>(CropSchema.name).deleteMany({})
    }
}