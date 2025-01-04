import { IntrospectAndCompose } from "@apollo/gateway"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { ApolloGatewayDriverConfig, ApolloGatewayDriver, ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { GraphQLModule as NestGraphQLModule } from "@nestjs/graphql"
import { envConfig } from "@src/env"
import { getHttpUrl } from "@src/common"
import responseCachePlugin from "@apollo/server-plugin-response-cache"
import { CacheAdapter } from "@src/cache"

@Module({})
export class GraphQLModule { 
    //gateway
    public static forGateway() {
        return {
            module: GraphQLModule,
            imports: [
                NestGraphQLModule.forRoot<ApolloGatewayDriverConfig>({
                    driver: ApolloGatewayDriver,
                    server: {
                        plugins: [ApolloServerPluginLandingPageLocalDefault()],
                        playground: false,
                        path: "/graphql",
                    },
                    gateway: {
                        supergraphSdl: new IntrospectAndCompose({
                            subgraphs: [
                                {
                                    name: "graphql",
                                    url: getHttpUrl({
                                        host: envConfig().containers.gameplaySubgraph.host,
                                        port: envConfig().containers.gameplaySubgraph.port,
                                        path: "graphql"
                                    }),
                                }
                            ]
                        })
                    }
                })
            ],
        }
    }

    //subgraph
    public static forSubgraph() {
        return {
            module: GraphQLModule,
            imports: [
                NestGraphQLModule.forRoot<ApolloFederationDriverConfig>({
                    driver: ApolloFederationDriver,
                    autoSchemaFile: {
                        federation: 2,
                    },
                    cache: new CacheAdapter(),
                    plugins: [responseCachePlugin()],
                    playground: false,
                    buildSchemaOptions: {
                        orphanedTypes: [],
                        directives: [
                            
                        ]
                    }

                })
            ],
            providers: [],
            exports: []
        }
    }
}