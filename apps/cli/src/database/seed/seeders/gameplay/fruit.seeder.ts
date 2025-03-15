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
                growthStageDuration: 300,
                growthStages: 5,
                unlockLevel: 10,
                basicHarvestExperiences: 12,
                qualityHarvestExperiences: 60,
                qualityProductChanceStack: 0.001,
                qualityProductChanceLimit: 0.1,
                minHarvestQuantity: 14,
                maxHarvestQuantity: 20,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
            },
            {
                _id: createObjectId(FruitId.Apple),
                displayId: FruitId.Apple,
                price: 5000,
                growthStageDuration: 3600,
                growthStages: 5,
                unlockLevel: 20,
                basicHarvestExperiences: 12,
                qualityHarvestExperiences: 60,
                qualityProductChanceStack: 0.001,
                qualityProductChanceLimit: 0.1,
                minHarvestQuantity: 14,
                maxHarvestQuantity: 20,
                nextGrowthStageAfterHarvest: 1,
                availableInShop: true,
            },
        ]

        await this.connection.model<FruitSchema>(FruitSchema.name).insertMany(data)
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping fruits...")
        await this.connection.model<FruitSchema>(FruitSchema.name).deleteMany({})
    }
}