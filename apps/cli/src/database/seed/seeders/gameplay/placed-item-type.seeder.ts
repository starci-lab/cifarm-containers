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
                sellable: true,
                sizeX: 1,
                sizeY: 1
            },

            // Animals
            {
                _id: createObjectId(PlacedItemTypeId.Chicken),
                displayId: PlacedItemTypeId.Chicken,
                type: PlacedItemType.Animal,
                animal: createObjectId(AnimalId.Chicken),
                sellable: true,
                sizeX: 1,
                sizeY: 1
            },
            {
                _id: createObjectId(PlacedItemTypeId.Cow),
                displayId: PlacedItemTypeId.Cow,
                type: PlacedItemType.Animal,
                animal: createObjectId(AnimalId.Cow),
                sellable: true,
                sizeX: 1,
                sizeY: 1
            },

            // Buildings
            {
                _id: createObjectId(PlacedItemTypeId.Home),
                displayId: PlacedItemTypeId.Home,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Home),
                sellable: false,
                sizeX: 4,
                sizeY: 4
            },
            {
                _id: createObjectId(PlacedItemTypeId.Barn),
                displayId: PlacedItemTypeId.Barn,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Barn),
                sellable: true,
                sizeX: 3,
                sizeY: 3
            },
            {
                _id: createObjectId(PlacedItemTypeId.Coop),
                displayId: PlacedItemTypeId.Coop,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.Coop),
                sellable: true,
                sizeX: 3,
                sizeY: 3
            },

            {
                _id: createObjectId(PlacedItemTypeId.PetHouse),
                displayId: PlacedItemTypeId.PetHouse,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.PetHouse),
                sellable: true,
                sizeX: 3,
                sizeY: 3
            },
            {
                _id: createObjectId(PlacedItemTypeId.BeeHouse),
                displayId: PlacedItemTypeId.BeeHouse,
                type: PlacedItemType.Building,
                building: createObjectId(BuildingId.BeeHouse),
                sellable: true,
                sizeX: 2,
                sizeY: 2
            },
            {
                _id: createObjectId(PlacedItemTypeId.Apple),
                displayId: PlacedItemTypeId.Apple,
                type: PlacedItemType.Fruit,
                fruit: createObjectId(FruitId.Apple),
                sellable: true,
                sizeX: 2,
                sizeY: 2
            },
            {
                _id: createObjectId(PlacedItemTypeId.Banana),
                displayId: PlacedItemTypeId.Banana,
                type: PlacedItemType.Fruit,
                fruit: createObjectId(FruitId.Banana),
                sellable: true,
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
