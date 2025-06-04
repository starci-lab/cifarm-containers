import { Inject, Injectable, Logger } from "@nestjs/common"
import { MongooseModule } from "@src/databases"
import { seeder } from "nestjs-seeder"
import {
    AnimalSeeder,
    BuildingSeeder,
    CropSeeder,
    InventoryTypeSeeder,
    PlacedItemTypeSeeder,
    SupplySeeder,
    SystemSeeder,
    TileSeeder,
    ToolSeeder,
    ProductSeeder,
    KeyValueStoreSeeder,
    PetSeeder,
    FruitSeeder,
    FlowerSeeder,
    FishSeeder,
    SeasonSeeder,
    TerrainSeeder
} from "./gameplay"
import { MODULE_OPTIONS_TOKEN } from "./seeders.module-definition"
import { SeederOptions } from "./types"

@Injectable()
export class SeedersService {
    private readonly logger = new Logger(SeedersService.name)
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: SeederOptions
    ) {}
    async runSeeders(): Promise<void> {
        seeder({
            imports: [MongooseModule.forRoot(this.options)]
        }).run([
            AnimalSeeder,
            BuildingSeeder,
            CropSeeder,
            SystemSeeder,
            InventoryTypeSeeder,
            ToolSeeder,
            TileSeeder,
            FlowerSeeder,
            SupplySeeder,
            PlacedItemTypeSeeder,
            ProductSeeder,
            KeyValueStoreSeeder,
            PetSeeder,
            FruitSeeder,
            FishSeeder,
            TerrainSeeder,
            SeasonSeeder
        ])
    }
}
