import { NestFactory } from "@nestjs/core"
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql"
import { getEnvValue } from "@src/utils"
import { writeFileSync } from "fs"
import { printSchema } from "graphql"
import { join } from "path"
import { AnimalsResolver } from "./animals"
import { AppModule } from "./app.module"
import { BuildingsResolver } from "./buildings"
import { CropsResolver } from "./crops"
import { ToolsResolver } from "./tools"
import { TilesResolver } from "./tiles"
import { SuppliesResolver } from "./supplies"
import { SpinsResolver } from "./spins"
import { DailyRewardsResolver } from "./daily-rewards"

const generateSchema = async () => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule)
    await app.init()

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
    const schema = await gqlSchemaFactory.create([
        AnimalsResolver,
        CropsResolver,
        ToolsResolver,
        BuildingsResolver,
        DailyRewardsResolver,
        SpinsResolver,
        SuppliesResolver,
        TilesResolver
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
