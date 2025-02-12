
import {
    InjectMongoose,
    SupplySchema,
    SupplyKey,
    SupplyType
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"

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
                key: SupplyKey.BasicFertilizer,
                type: SupplyType.Fertilizer,
                price: 50,
                availableInShop: true,
                fertilizerEffectTimeReduce: 60 * 30,
            },
            {
                key: SupplyKey.AnimalFeed,
                type: SupplyType.AnimalFeed,
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
