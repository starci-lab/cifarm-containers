import { IntrospectAndCompose } from "@apollo/gateway"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { ApolloGatewayDriverConfig, ApolloGatewayDriver, ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { DynamicModule } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { GraphQLModule, GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from "@nestjs/graphql"
import { dirConfig, envConfig } from "@src/config"
import { getHttpAddress } from "@src/utils"
import { mkdirSync, writeFileSync } from "fs"
import { printSchema } from "graphql"
import { join, dirname } from "path"

export const graphqlMaingraphForRoot = (): DynamicModule => {
    return GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
        driver: ApolloGatewayDriver,
        server: {
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
            playground: false,
            path: "/graphql"
        },
        gateway: {
            supergraphSdl: new IntrospectAndCompose({
                subgraphs: [
                    {
                        name: "graphql",
                        url: getHttpAddress(envConfig().containers.gameplaySubgraph.host, envConfig().containers.gameplaySubgraph.port, "graphql"),
                    }
                ]
            })
        }
    })
}

export const gameplaySubgraphForRoot = (subgraphFile: string): DynamicModule => {
    return (
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            typePaths: [`./${dirConfig.generated}/${subgraphFile}`],
            playground: false,
            buildSchemaOptions: {
                orphanedTypes: []
            }
        })
    )
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const generateSchema = async (resolvers: Array<Function>, subgraphFile: string) => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule)
    await app.init()

    const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
    const schema = await gqlSchemaFactory.create(resolvers)

    const outputPath = join(process.cwd(), join(dirConfig.generated, subgraphFile))
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, printSchema(schema))
}