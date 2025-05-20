import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    FlowerId,
    FlowerSchema,
    InjectMongoose,
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class FlowerSeeder implements Seeder {
    private readonly logger = new Logger(FlowerSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}
        
    public async seed(): Promise<void> {
        this.logger.debug("Seeding flowers...")
        try {
            const data: Array<Partial<FlowerSchema>> = [
                {
                    _id: createObjectId(FlowerId.Daisy),
                    displayId: FlowerId.Daisy,
                    price: 50,
                    growthStageDuration: 300,
                    unlockLevel: 1,
                    basicHarvestExperiences: 6,
                    qualityHarvestExperiences: 12,
                    harvestQuantity: 20,
                    availableInShop: true,
                    honeyYieldCoefficient: 2.5,
                    honeyQualityChancePlus: 0
                },
                {
                    _id: createObjectId(FlowerId.Sunflower),
                    displayId: FlowerId.Sunflower,
                    price: 50,
                    growthStageDuration: 300,
                    unlockLevel: 1,
                    basicHarvestExperiences: 6,
                    qualityHarvestExperiences: 12,
                    harvestQuantity: 20,
                    availableInShop: true,
                    honeyYieldCoefficient: 2.5,
                    honeyQualityChancePlus: 0
                }
            ]

            await this.connection.model<FlowerSchema>(FlowerSchema.name).insertMany(data)
        } catch (error) {
            this.logger.error(error)
        }
    }
    
    async drop(): Promise<void> {
        this.logger.verbose("Dropping flowers...")
        await this.connection.model<FlowerSchema>(FlowerSchema.name).deleteMany({})
    }
}