import { IntrospectAndCompose } from "@apollo/gateway"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { ApolloGatewayDriverConfig, ApolloGatewayDriver, ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { DynamicModule } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"
import { envConfig } from "@src/config"
import { getHttpAddress } from "@src/utils"

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

export const gameplaySubgraphForRoot = (): DynamicModule => {
    return (
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            autoSchemaFile: {
                federation: 2,
            },
            playground: false,
            buildSchemaOptions: {
                orphanedTypes: []
            }
        })
    )
}