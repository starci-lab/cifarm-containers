import { NestFactory } from "@nestjs/core"
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql"
import { getEnvValue } from "@src/utils"
import { writeFileSync } from "fs"
import { printSchema } from "graphql"
import { join } from "path"
import { AppModule } from "./app.module"
import { AnimalInfosResolver } from "./animal-infos"
import { AnimalsResolver } from "./animals"
import { BuildingInfosResolver } from "./building-infos"
import { BuildingsResolver } from "./buildings"
import { CropsResolver } from "./crops"
import { DailyRewardPossibilitiesResolver } from "./daily-reward-possibilities"
import { DailyRewardsResolver } from "./daily-rewards"
import { InventoryResolver } from "./inventories"
import { InventoryTypeResolver } from "./inventory-types"
import { PlacedItemTypesResolver } from "./placed-item-types"
import { PlacedItemsResolver } from "./placed-items"
import { ProductResolver } from "./products"
import { SeedGrowthInfoThiefedByUsersResolver } from "./seed-growth-info-thiefed-by-users"
import { SeedGrowthInfosResolver } from "./seed-growth-infos"
import { SpinsResolver } from "./spins"
import { SuppliesResolver } from "./supplies"
import { SystemsResolver } from "./systems"
import { TilesResolver } from "./tiles"
import { ToolsResolver } from "./tools"
import { UpgradeResolver } from "./upgrades"
import { UserResolver } from "./users"
import { AnimalInfoThievedByUsersResolver } from "./animal-info-thieved-by-users/animal-info-thieved-by-users.resolver"

const generateSchema = async () => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule)
    await app.init()

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
    const schema = await gqlSchemaFactory.create([
        AnimalsResolver,
        AnimalInfosResolver,
        AnimalInfoThievedByUsersResolver,
        BuildingsResolver,
        BuildingInfosResolver,
        CropsResolver,
        DailyRewardPossibilitiesResolver,
        DailyRewardsResolver,
        InventoryResolver,
        InventoryTypeResolver,
        PlacedItemTypesResolver,
        PlacedItemsResolver,
        ProductResolver,
        SeedGrowthInfosResolver,
        SeedGrowthInfoThiefedByUsersResolver,
        SpinsResolver,
        SuppliesResolver,
        SystemsResolver,
        TilesResolver,
        ToolsResolver,
        UpgradeResolver,
        UserResolver
    ])

    writeFileSync(
        join(
            process.cwd(),
            `${getEnvValue({ development: "src", production: "dist" })}/schema.gql`
        ),
        printSchema(schema)
    )
}
const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(3007)
}
generateSchema().then(() => bootstrap())
