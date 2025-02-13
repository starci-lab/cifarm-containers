import {
    TileId,
    AnimalId,
    BuildingId,
    PlacedItemType,
    PlacedItemTypeKey,
    PlacedItemTypeSchema,
    InjectMongoose
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

@Injectable()
export class PlacedItemTypeSeeder implements Seeder {
    private readonly logger = new Logger(PlacedItemTypeSeeder.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async seed(): Promise<void> {
        this.logger.debug("Seeding placed item types...")

        const data: Array<Partial<PlacedItemTypeSchema>> = [
            // Tiles
            {
                _id: createObjectId(PlacedItemTypeKey.StarterTile),
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.StarterTile)
            },
            {
                _id: createObjectId(PlacedItemTypeKey.BasicTile1),
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.BasicTile1)
            },
            {
                _id: createObjectId(PlacedItemTypeKey.BasicTile2),
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.BasicTile2)
            },
            {
                _id: createObjectId(PlacedItemTypeKey.BasicTile3),
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.BasicTile3)
            },
            {
                _id: createObjectId(PlacedItemTypeKey.FertileTile),
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.FertileTile)
            },

            // Animals
            {
                _id: createObjectId(PlacedItemTypeKey.Chicken),
                type: PlacedItemType.Animal,
                animal: createObjectId(AnimalId.Chicken)
            },
            {
                _id: createObjectId(PlacedItemTypeKey.Cow),
                type: PlacedItemType.Animal,
                animal: createObjectId(AnimalId.Cow)
            },

            // Buildings
            {
                _id: createObjectId(PlacedItemTypeKey.Home),
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Home)
            },
            {
                _id: createObjectId(PlacedItemTypeKey.Barn),
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Barn)
            },
            {
                _id: createObjectId(PlacedItemTypeKey.Coop),
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Coop)
            }
        ]

        await this.connection
            .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
            .insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping placed item types...")
        await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).deleteMany({})
    }
}
