
import {
    InjectMongoose,
    DecorationSchema,
    DecorationId,
    DecorationType
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

@Injectable()
export class DecorationSeeder implements Seeder {
    private readonly logger = new Logger(DecorationSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding decorations...")
        const data: Array<Partial<DecorationSchema>> = [
            {
                _id: createObjectId(DecorationId.WoodenFence),
                displayId: DecorationId.WoodenFence,
                type: DecorationType.Fence,
                sellable: true,
                price: 20,
                sellPrice: 10,
                availableInShop: true,
            },
        ]
        try {
            await this.connection.model<DecorationSchema>(DecorationSchema.name).insertMany(data)
        } catch (error) {
            console.error(error)
        }
    }

        
    async drop(): Promise<void> {
        this.logger.verbose("Dropping decorations...")
        await this.connection.model<DecorationSchema>(DecorationSchema.name).deleteMany({})
    }
}
