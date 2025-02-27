
import {
    InjectMongoose,
    SupplySchema,
    SupplyId,
    SupplyType
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

@Injectable()
export class SupplySeeder implements Seeder {
    private readonly logger = new Logger(SupplySeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding supplies...")
        const data: Array<Partial<SupplySchema>> = [
            {
                _id: createObjectId(SupplyId.BasicFertilizer),
                displayId: SupplyId.BasicFertilizer,
                type: SupplyType.Fertilizer,
                price: 50,
                availableInShop: true,
                fertilizerEffectTimeReduce: 60 * 30,
            },
            {
                _id: createObjectId(SupplyId.AnimalFeed),
                displayId: SupplyId.AnimalFeed,
                type: SupplyType.AnimalFeed,
                price: 50,
                availableInShop: true,
            },
            {
                _id: createObjectId(SupplyId.AnimalPill),
                displayId: SupplyId.AnimalPill,
                type: SupplyType.AnimalPill,
                price: 50,
                availableInShop: true,
            }
        ]
        await this.connection.model<SupplySchema>(SupplySchema.name).insertMany(data)
    }
        
    async drop(): Promise<void> {
        this.logger.verbose("Dropping supplies...")
        await this.connection.model<SupplySchema>(SupplySchema.name).deleteMany({})
    }
}
