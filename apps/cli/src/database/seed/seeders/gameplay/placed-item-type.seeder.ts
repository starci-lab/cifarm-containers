import {
    TileId,
    AnimalId,
    BuildingId,
    PlacedItemType,
    PlacedItemTypeId,
    PlacedItemTypeSchema,
    InjectMongoose,
    FruitId
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
            {
                _id: createObjectId(PlacedItemTypeId.BasicTile),
                displayId: PlacedItemTypeId.BasicTile,
                type: PlacedItemType.Tile,
                tile: createObjectId(TileId.BasicTile),
                sizeX: 1,
                sizeY: 1
            },

            // Animals
            {
                _id: createObjectId(PlacedItemTypeId.Chicken),
                displayId: PlacedItemTypeId.Chicken,
                type: PlacedItemType.Animal,
                animal: createObjectId(AnimalId.Chicken),
                sizeX: 1,
                sizeY: 1
            },
            {
                _id: createObjectId(PlacedItemTypeId.Cow),
                displayId: PlacedItemTypeId.Cow,
                type: PlacedItemType.Animal,
                animal: createObjectId(AnimalId.Cow),
                sizeX: 1,
                sizeY: 1
            },

            // Buildings
            {
                _id: createObjectId(PlacedItemTypeId.Home),
                displayId: PlacedItemTypeId.Home,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Home),
                sizeX: 4,
                sizeY: 4
            },
            {
                _id: createObjectId(PlacedItemTypeId.Barn),
                displayId: PlacedItemTypeId.Barn,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Barn),
                sizeX: 3,
                sizeY: 3
            },
            {
                _id: createObjectId(PlacedItemTypeId.Coop),
                displayId: PlacedItemTypeId.Coop,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Coop),
                sizeX: 3,
                sizeY: 3
            },

            {
                _id: createObjectId(PlacedItemTypeId.PetHouse),
                displayId: PlacedItemTypeId.PetHouse,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.PetHouse),
                sizeX: 3,
                sizeY: 3
            },
            {
                _id: createObjectId(PlacedItemTypeId.BeeHouse),
                displayId: PlacedItemTypeId.BeeHouse,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.BeeHouse),
                sizeX: 2,
                sizeY: 2
            },
            {
                _id: createObjectId(PlacedItemTypeId.Apple),
                displayId: PlacedItemTypeId.Apple,
                type: PlacedItemType.Fruit,
                fruit: createObjectId(FruitId.Apple),
                sizeX: 2,
                sizeY: 2
            },
            {
                _id: createObjectId(PlacedItemTypeId.Banana),
                displayId: PlacedItemTypeId.Banana,
                type: PlacedItemType.Fruit,
                fruit: createObjectId(FruitId.Banana),
                sizeX: 2,
                sizeY: 2
            },
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
