import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import {
    GraphQLSchemaBuilderModule,
    GraphQLSchemaFactory,
} from "@nestjs/graphql"
import { getEnvValue } from "@src/utils"
import { writeFileSync } from "fs"
import { join } from "path"
import { printSchema } from "graphql"
import { AnimalsResolver } from "./animals"
import { CropsResolver } from "./crops"
import { ToolsResolver } from "./tools"
import { BuildingsResolver } from "./buildings"
import { UpgradesResolver } from "./upgrades"

const generateSchema = async () => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule)
    await app.init()

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
    const schema = await gqlSchemaFactory.create([AnimalsResolver, CropsResolver, ToolsResolver, BuildingsResolver, UpgradesResolver])

    writeFileSync(
        join(
            process.cwd(),
            `${getEnvValue({ development: "src", production: "dist" })}/schema.gql`,
        ),
        printSchema(schema),
    )
}
const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(3007)
}
generateSchema().then(() => bootstrap())
