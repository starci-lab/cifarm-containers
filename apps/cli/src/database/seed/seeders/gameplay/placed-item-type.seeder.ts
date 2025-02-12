import {
    TileKey,
    AnimalKey,
    BuildingKey,
    PlacedItemType,
    PlacedItemTypeKey,
    PlacedItemTypeSchema,
    InjectMongoose
} from "@src/databases"
import { Injectable, Logger } from "@nestjs/common"
import { Seeder } from "nestjs-seeder"
import { Connection } from "mongoose"

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
            { key: PlacedItemTypeKey.DefaultInfoTile, type: PlacedItemType.Tile, refKey: TileKey.DefaultInfoTile },
            { key: PlacedItemTypeKey.BasicTile1, type: PlacedItemType.Tile, refKey: TileKey.BasicTile1 },
            { key: PlacedItemTypeKey.BasicTile2, type: PlacedItemType.Tile, refKey: TileKey.BasicTile2 },
            { key: PlacedItemTypeKey.BasicTile3, type: PlacedItemType.Tile, refKey: TileKey.BasicTile3 },
            { key: PlacedItemTypeKey.FertileTile, type: PlacedItemType.Tile, refKey: TileKey.FertileTile },

            // Animals
            { key: PlacedItemTypeKey.Chicken, type: PlacedItemType.Animal, refKey: AnimalKey.Chicken },
            { key: PlacedItemTypeKey.Cow, type: PlacedItemType.Animal, refKey: AnimalKey.Cow },
            { key: PlacedItemTypeKey.Pig, type: PlacedItemType.Animal, refKey: AnimalKey.Pig },
            { key: PlacedItemTypeKey.Sheep, type: PlacedItemType.Animal, refKey: AnimalKey.Sheep },

            // Buildings
            { key: PlacedItemTypeKey.Coop, type: PlacedItemType.Building, refKey: BuildingKey.Coop },
            { key: PlacedItemTypeKey.Barn, type: PlacedItemType.Building, refKey: BuildingKey.Barn },
            { key: PlacedItemTypeKey.Home, type: PlacedItemType.Building, refKey: BuildingKey.Home }
        ]

        await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).insertMany(data)
    }

    async drop(): Promise<void> {
        this.logger.verbose("Dropping placed item types...")
        await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).deleteMany({})
    }
}
