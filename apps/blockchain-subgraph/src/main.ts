import { NestFactory } from "@nestjs/core"
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql"
import { getEnvValue } from "@src/utils"
import { mkdirSync, writeFileSync } from "fs"
import { printSchema } from "graphql"
import { dirname, join } from "path"
import { AppModule } from "./app.module"

const generateSchema = async () => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule)
    await app.init()

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
    const schema = await gqlSchemaFactory.create([

    ])

    const outputPath = join(process.cwd(), `${getEnvValue({ development: "src", production: "dist" })}/schema.gql`)
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, printSchema(schema))
}
const bootstrap = async () => {
    const app = await NestFactory.create(AppModule)
    await app.listen(3008)
}
generateSchema().then(() => bootstrap())
