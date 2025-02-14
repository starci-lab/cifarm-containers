import {
    TileId,
    AnimalId,
    BuildingId,
    PlacedItemType,
    PlacedItemTypeId,
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
                _id: createObjectId(PlacedItemTypeId.StarterTile),
                displayId: PlacedItemTypeId.StarterTile,
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.StarterTile)
            },
            {
                _id: createObjectId(PlacedItemTypeId.BasicTile1),
                displayId: PlacedItemTypeId.BasicTile1,
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.BasicTile1)
            },
            {
                _id: createObjectId(PlacedItemTypeId.BasicTile2),
                displayId: PlacedItemTypeId.BasicTile2,
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.BasicTile2)
            },
            {
                _id: createObjectId(PlacedItemTypeId.BasicTile3),
                displayId: PlacedItemTypeId.BasicTile3,
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.BasicTile3)
            },
            {
                _id: createObjectId(PlacedItemTypeId.FertileTile),
                displayId: PlacedItemTypeId.FertileTile,
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.FertileTile)
            },

            // Animals
            {
                _id: createObjectId(PlacedItemTypeId.Chicken),
                displayId: PlacedItemTypeId.Chicken,
                type: PlacedItemType.Animal,
                animal: createObjectId(AnimalId.Chicken)
            },
            {
                _id: createObjectId(PlacedItemTypeId.Cow),
                displayId: PlacedItemTypeId.Cow,
                type: PlacedItemType.Animal,
                animal: createObjectId(AnimalId.Cow)
            },

            // Buildings
            {
                _id: createObjectId(PlacedItemTypeId.Home),
                displayId: PlacedItemTypeId.Home,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Home)
            },
            {
                _id: createObjectId(PlacedItemTypeId.Barn),
                displayId: PlacedItemTypeId.Barn,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Barn)
            },
            {
                _id: createObjectId(PlacedItemTypeId.Coop),
                displayId: PlacedItemTypeId.Coop,
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
