import { IntrospectAndCompose } from "@apollo/gateway"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { ApolloGatewayDriverConfig, ApolloGatewayDriver, ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { DynamicModule } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"
import { envConfig } from "@src/config"
  
export const graphqlMaingraphForRoot = (): DynamicModule => {
    return GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
        driver: ApolloGatewayDriver,
        server: {
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
            playground: false
        },
        gateway: {
            supergraphSdl: new IntrospectAndCompose({
                subgraphs: [
                    {
                        name: "graphql",
                        url: envConfig().graphqlFederation.subgraphUrls.static
                    }
                ]
            })
        }
    })
}

export const graphqlGameplaySubgraphForRoot = (): DynamicModule => {
    return (
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            typePaths: ["./**/*.gql"],
            playground: false,
            buildSchemaOptions: {
                orphanedTypes: []
            }
        })
    )
}