import { NestFactory } from "@nestjs/core"
import { AppModule, GAMEPLAY_SUBGRAPH_GQL_NAME } from "./app.module"
import { AnimalInfosResolver } from "./animal-infos"
import { AnimalsResolver } from "./animals"
import { BuildingInfosResolver } from "./building-infos"
import { BuildingsResolver } from "./buildings"
import { CropsResolver } from "./crops"
import { DailyRewardsResolver } from "./daily-rewards"
import { InventoryResolver } from "./inventories"
import { InventoryTypeResolver } from "./inventory-types"
import { PlacedItemTypesResolver } from "./placed-item-types"
import { PlacedItemsResolver } from "./placed-items"
import { ProductResolver } from "./products"
import { SeedGrowthInfoThiefedByUsersResolver } from "./seed-growth-info-thiefed-by-users"
import { SeedGrowthInfosResolver } from "./seed-growth-infos"
import { SuppliesResolver } from "./supplies"
import { SystemsResolver } from "./systems"
import { TilesResolver } from "./tiles"
import { ToolsResolver } from "./tools"
import { UpgradeResolver } from "./upgrades"
import { UserResolver } from "./users"
import { AnimalInfoThievedByUsersResolver } from "./animal-info-thieved-by-users"
import { envConfig } from "@src/config"
import { generateSchema } from "@src/dynamic-modules"

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(envConfig().containers.gameplaySubgraph.port)
}
generateSchema([
    AnimalsResolver,
    AnimalInfosResolver,
    AnimalInfoThievedByUsersResolver,
    BuildingsResolver,
    BuildingInfosResolver,
    CropsResolver,
    DailyRewardsResolver,
    InventoryResolver,
    InventoryTypeResolver,
    PlacedItemTypesResolver,
    PlacedItemsResolver,
    ProductResolver,
    SeedGrowthInfosResolver,
    SeedGrowthInfoThiefedByUsersResolver,
    SuppliesResolver,
    SystemsResolver,
    TilesResolver,
    ToolsResolver,
    UpgradeResolver,
    UserResolver
], GAMEPLAY_SUBGRAPH_GQL_NAME).then(() => bootstrap())
