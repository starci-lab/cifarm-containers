import { NestFactory } from "@nestjs/core"
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql"
import { getEnvValue } from "@src/utils"
import { mkdirSync, writeFileSync } from "fs"
import { printSchema } from "graphql"
import { dirname, join } from "path"
import { AppModule } from "./app.module"
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
    ])

    const outputPath = join(process.cwd(), `${getEnvValue({ development: "src", production: "dist" })}/schema.gql`)
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, printSchema(schema))
}
const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(3007)
}
generateSchema().then(() => bootstrap())
