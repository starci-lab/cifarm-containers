import { SeederConstructor } from "typeorm-extension"
import { AnimalSeeder } from "./animal.seeder"
import { BuildingSeeder } from "./building.seeder"
import { CropSeeder } from "./crop.seeder"
import { DailyRewardSeeder } from "./daily-reward.seeder"
import { SpinPrizeSeeder } from "./spin-prize.seeder"
import { SupplySeeder } from "./supply.seeder"
import { SystemSeeder } from "./system.seeder"
import { TempSeeder } from "./temp.seeder"
import { TileSeeder } from "./tile.seeder"
import { ToolSeeder } from "./tool.seeder"
import { SpinSlotSeeder } from "./spin-slot.seeder"

export const gameplaySeeders = (): Array<SeederConstructor> => [
    SystemSeeder,
    TempSeeder,
    AnimalSeeder,
    CropSeeder,
    BuildingSeeder,
    ToolSeeder,
    TileSeeder,
    SupplySeeder,
    DailyRewardSeeder,
    SpinPrizeSeeder,
    SpinSlotSeeder,
]