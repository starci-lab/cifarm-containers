import { IntrospectAndCompose } from "@apollo/gateway"
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { ApolloFederationDriver, ApolloFederationDriverConfig, ApolloGatewayDriver, ApolloGatewayDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { Int, GraphQLModule as NestGraphQLModule } from "@nestjs/graphql"
import { CacheAdapter } from "@src/cache"
import { getHttpUrl } from "@src/common"
import { envConfig } from "@src/env"
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLEnumType } from "graphql"
import responseCachePlugin from "@apollo/server-plugin-response-cache"

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
                        plugins: [
                            ApolloServerPluginLandingPageLocalDefault(),
                        ],
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
                    plugins: [
                        ApolloServerPluginCacheControl(), responseCachePlugin()
                    ],
                    playground: false,
                    buildSchemaOptions: {
                        orphanedTypes: [],
                        directives: [
                            new GraphQLDirective({
                                name: "cacheControl",
                                args: {
                                    maxAge: { type: Int },
                                    scope: {
                                        type: new GraphQLEnumType({
                                            name: "CacheControlScope",
                                            values: {
                                                PUBLIC: {},
                                                PRIVATE: {},
                                            },
                                        }),
                                    },
                                    inheritMaxAge: { type: GraphQLBoolean },
                                },
                                locations: [
                                    DirectiveLocation.FIELD_DEFINITION,
                                    DirectiveLocation.OBJECT,
                                    DirectiveLocation.INTERFACE,
                                    DirectiveLocation.UNION,
                                    DirectiveLocation.QUERY,
                                ],
                            }),
                        ]
                    }
                })
            ],
            providers: [],
            exports: []
        }
    }
}