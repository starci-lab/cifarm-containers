import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    FruitId,
    FruitSchema,
    InjectMongoose,
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class FruitSeeder implements Seeder {
    private readonly logger = new Logger(FruitSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        this.logger.debug("Seeding fruits...")
        const data: Array<Partial<FruitSchema>> = [
            {
                _id: createObjectId(FruitId.Banana),
                displayId: FruitId.Banana,
                price: 5000,
                youngGrowthStageDuration: 60 * 60 * 12, // 12 hours
                matureGrowthStageDuration: 60 * 60 * 6, // 6 hours
                fertilizerTime: 60 * 60 * 8, // 8 hour
                unlockLevel: 10,
                basicHarvestExperiences: 12,
                qualityHarvestExperiences: 24,
                harvestQuantity: 20,
                availableInShop: true,
                sellable: true,
                sellPrice: 2500
            },
            {
                _id: createObjectId(FruitId.Apple),
                displayId: FruitId.Apple,
                price: 5000,
                youngGrowthStageDuration: 60 * 60 * 12, // 12 hours
                matureGrowthStageDuration: 60 * 60 * 6, // 6 hours
                fertilizerTime: 60 * 60 * 8, // 8 hour
                unlockLevel: 10,
                basicHarvestExperiences: 12,
                qualityHarvestExperiences: 24,
                harvestQuantity: 20,
                availableInShop: true,
                sellable: true,
                sellPrice: 2500
            },
            {
                _id: createObjectId(FruitId.DragonFruit),
                displayId: FruitId.DragonFruit,
                price: 5000,
                youngGrowthStageDuration: 60 * 60 * 18, // 18 hours
                matureGrowthStageDuration: 60 * 60 * 9, // 9 hours
                fertilizerTime: 60 * 60 * 8, // 8 hour
                basicHarvestExperiences: 24,
                qualityHarvestExperiences: 48,
                harvestQuantity: 20,
                availableInShop: false,
                sellable: false,
                isNFT: true
            },
            {
                _id: createObjectId(FruitId.Jackfruit),
                displayId: FruitId.Jackfruit,
                price: 5000,
                youngGrowthStageDuration: 60 * 60 * 18, // 18 hours
                matureGrowthStageDuration: 60 * 60 * 9, // 9 hours
                fertilizerTime: 60 * 60 * 8, // 8 hour
                basicHarvestExperiences: 24,
                qualityHarvestExperiences: 48,
                harvestQuantity: 20,
                availableInShop: false,
                sellable: false,
                isNFT: true
            },
            {
                _id: createObjectId(FruitId.Rambutan),
                displayId: FruitId.Rambutan,
                price: 5000,
                youngGrowthStageDuration: 60 * 60 * 18, // 18 hours
                matureGrowthStageDuration: 60 * 60 * 9, // 9 hours
                fertilizerTime: 60 * 60 * 8, // 8 hour
                basicHarvestExperiences: 24,
                qualityHarvestExperiences: 48,
                harvestQuantity: 20,
                availableInShop: false,
                sellable: false,
                isNFT: true
            },
            {   
                _id: createObjectId(FruitId.Pomegranate),   
                displayId: FruitId.Pomegranate,
                price: 5000,
                youngGrowthStageDuration: 60 * 60 * 18, // 18 hours
                matureGrowthStageDuration: 60 * 60 * 9, // 9 hours
                fertilizerTime: 60 * 60 * 8, // 8 hour
                basicHarvestExperiences: 24,
                qualityHarvestExperiences: 48,
                harvestQuantity: 20,
                availableInShop: false,
                sellable: false,
                isNFT: true
            }
        ]
        try {
            await this.connection.model<FruitSchema>(FruitSchema.name).insertMany(data)
        } catch (error) {
            this.logger.error(error)
        }
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping fruits...")
        await this.connection.model<FruitSchema>(FruitSchema.name).deleteMany({})
    }
}