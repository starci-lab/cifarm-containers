
import {
    AnimalType,
    AnimalSchema,
    AnimalId,
    InjectMongoose
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

@Injectable()
export class AnimalSeeder implements Seeder {
    private readonly logger = new Logger(AnimalSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding animals...")
        const data: Array<Partial<AnimalSchema>> = [
            {
                _id: createObjectId(AnimalId.Chicken),
                displayId: AnimalId.Chicken,
                yieldTime: 60 * 60 * 6, // 6 hours
                offspringPrice: 1000,
                isNFT: false,
                growthTime: 60 * 60 * 24 * 4, // 4 days
                availableInShop: true,
                hungerTime: 60 * 60 * 12,
                harvestQuantity: 20,
                basicHarvestExperiences: 32,
                qualityHarvestExperiences: 64,
                price: 1000,
                type: AnimalType.Poultry,
                unlockLevel: 5,
                sellable: true,
                sellPrice: 500,
            },
            {
                _id: createObjectId(AnimalId.Cow),
                displayId: AnimalId.Cow,
                yieldTime: 60 * 60 * 8, // 8 hours
                offspringPrice: 2500,
                isNFT: false,
                growthTime: 60 * 60 * 24 * 10, // 10 days
                availableInShop: true,
                hungerTime: 60 * 60 * 12,
                harvestQuantity: 20,
                basicHarvestExperiences: 54,
                qualityHarvestExperiences: 108,
                price: 2500,
                type: AnimalType.Livestock,
                unlockLevel: 10,
                sellPrice: 1250,
                sellable: true,
            }
        ]
        try {
            await this.connection.model<AnimalSchema>(AnimalSchema.name).insertMany(data)
        } catch (error) {
            console.error(error)
        }
    }

        
    async drop(): Promise<void> {
        this.logger.verbose("Dropping animals...")
        await this.connection.model<AnimalSchema>(AnimalSchema.name).deleteMany({})
    }
}
