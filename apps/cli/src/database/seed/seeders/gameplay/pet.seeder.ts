import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { InjectMongoose, PetSchema, PetId } from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class PetSeeder implements Seeder {
    private readonly logger = new Logger(PetSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding pets...")

        const data: Array<Partial<PetSchema>> = [
            {
                _id: createObjectId(PetId.Dog),
                displayId: PetId.Dog,
                availableInShop: true,
                price: 1000,
                unlockLevel: 20,
                sellPrice: 500,
            },
            {
                _id: createObjectId(PetId.Cat),
                availableInShop: true,
                displayId: PetId.Cat,
                price: 1000,
                unlockLevel: 20,
                sellPrice: 500,
            },
        ]

        await this.connection.model<PetSchema>(PetSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping pets...")
        await this.connection.model<PetSchema>(PetSchema.name).deleteMany({})
    }
}
