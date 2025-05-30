import { Injectable, Logger } from "@nestjs/common"
import { createObjectId } from "@src/common"
import {
    InjectMongoose,
    PlacedItemTypeId,
    TileId,
    TileSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { Seeder } from "nestjs-seeder"

@Injectable()
export class TileSeeder implements Seeder {
    private readonly logger = new Logger(TileSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding tiles...")

        const data: Array<Partial<TileSchema>> = [
            {
                _id: createObjectId(TileId.BasicTile),
                displayId: TileId.BasicTile,
                price: 1000,
                isNFT: false,
                sellable: true,
                qualityProductChanceStack: 0,
                qualityProductChanceLimit: 0,
                availableInShop: true,
                placedItemTypeKey: PlacedItemTypeId.BasicTile,
                sellPrice: 500,
            }
        ]

        await this.connection.model<TileSchema>(TileSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping tiles...")
        await this.connection.model<TileSchema>(TileSchema.name).deleteMany({})
    }
}
