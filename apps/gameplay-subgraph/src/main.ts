import { NestFactory } from "@nestjs/core"
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql"
import { getEnvValue } from "@src/utils"
import { writeFileSync } from "fs"
import { printSchema } from "graphql"
import { join } from "path"
import { AppModule } from "./app.module"
import { Resolvers } from "@apps/gameplay-subgraph/src/"

const generateSchema = async () => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule)
    await app.init()

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
    const schema = await gqlSchemaFactory.create([
        ...Object.values(Resolvers)
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
