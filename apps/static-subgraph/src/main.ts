import { NestFactory } from "@nestjs/core"
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql"
import { getEnvValue } from "@src/utils"
import { writeFileSync } from "fs"
import { printSchema } from "graphql"
import { join } from "path"
import { AppModule } from "./app.module"
import { UserResolver } from "@apps/static-subgraph/src/users"
import { TilesResolver } from "@apps/static-subgraph/src/tiles"
import { SuppliesResolver } from "@apps/static-subgraph/src/supplies"
import { SpinsResolver } from "@apps/static-subgraph/src/spins"
import { DailyRewardsResolver } from "@apps/static-subgraph/src/daily-rewards"
import { BuildingsResolver } from "@apps/static-subgraph/src/buildings"
import { CropsResolver } from "@apps/static-subgraph/src/crops"
import { AnimalsResolver } from "@apps/static-subgraph/src/animals"
import { ToolsResolver } from "@apps/static-subgraph/src/tools"

const generateSchema = async () => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule)
    await app.init()

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
    const schema = await gqlSchemaFactory.create([
        AnimalsResolver,
        BuildingsResolver,
        CropsResolver,
        DailyRewardsResolver,
        SpinsResolver,
        SuppliesResolver,
        TilesResolver,
        ToolsResolver,
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
