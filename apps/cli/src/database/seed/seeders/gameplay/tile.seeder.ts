import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    PlacedItemTypeKey,
    TileKey,
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
                key: TileKey.StarterTile,
                price: 0,
                maxOwnership: 6,
                isNft: false,
                qualityProductChanceStack: 0,
                qualityProductChanceLimit: 0,
                availableInShop: true,
                placedItemTypeKey: PlacedItemTypeKey.StarterTile
            },
            {
                key: TileKey.BasicTile1,
                price: 1000,
                maxOwnership: 10,
                isNft: false,
                qualityProductChanceStack: 0,
                qualityProductChanceLimit: 0,
                availableInShop: true,
                placedItemTypeKey: PlacedItemTypeKey.BasicTile1
            },
            {
                key: TileKey.BasicTile2,
                price: 2500,
                maxOwnership: 30,
                isNft: false,
                availableInShop: true,
                qualityProductChanceStack: 0.001,
                qualityProductChanceLimit: 0.1,
                placedItemTypeKey: PlacedItemTypeKey.BasicTile1
            },
            {
                key: TileKey.BasicTile3,
                price: 10000,
                maxOwnership: 9999,
                isNft: false,
                qualityProductChanceStack: 0.002,
                qualityProductChanceLimit: 0.2,
                availableInShop: true,
                placedItemTypeKey: PlacedItemTypeKey.BasicTile3
            },
            {
                key: TileKey.FertileTile,
                isNft: true,
                qualityProductChanceStack: 0.025,
                qualityProductChanceLimit: 0.5,
                availableInShop: false,
                placedItemTypeKey: PlacedItemTypeKey.FertileTile
            }
        ]

        await this.connection.model<TileSchema>(TileSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping tiles...")
        await this.connection.model<TileSchema>(TileSchema.name).deleteMany({})
    }
}
