import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import { InjectMongoose, PetSchema, PetId, PetType } from "@src/databases"
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
                price: 4000,
                unlockLevel: 20,
                sellPrice: 2000,
                type: PetType.Dog,
                helpSuccessExperience: 24,
                sellable: true,
            },
            {
                _id: createObjectId(PetId.Cat),
                availableInShop: true,
                displayId: PetId.Cat,
                price: 4000,
                unlockLevel: 20,
                sellPrice: 2000,
                type: PetType.Cat,
                helpSuccessExperience: 24,
                sellable: true,
            },
        ]

        await this.connection.model<PetSchema>(PetSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping pets...")
        await this.connection.model<PetSchema>(PetSchema.name).deleteMany({})
    }
}
