import { IntrospectAndCompose } from "@apollo/gateway"
import responseCachePlugin from "@apollo/server-plugin-response-cache"
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { ApolloFederationDriver, ApolloFederationDriverConfig, ApolloGatewayDriver, ApolloGatewayDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { Int, GraphQLModule as NestGraphQLModule } from "@nestjs/graphql"
import { KeyvManagerService } from "@src/cache/keyv-manager.service"
import { getHttpUrl } from "@src/common"
import { envConfig, RedisType } from "@src/env"
import { ExecDockerRedisClusterService, ExecModule, ExecService } from "@src/exec"
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLEnumType } from "graphql"
import { ConfigurableModuleClass } from "./graphql.module-definition"

@Module({})
export class GraphQLModule extends ConfigurableModuleClass { 
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
                NestGraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
                    driver: ApolloFederationDriver,
                    imports: [
                        ExecModule.register({
                            docker: {
                                redisCluster: {
                                    networkName:
                                        envConfig().databases.redis[RedisType.Cache].cluster.dockerNetworkName
                                }
                            }
                        })
                    ],
                    inject: [ExecService],
                    useFactory: async (execDockerRedisClusterService: ExecDockerRedisClusterService) => {
                        const keyvManager = new KeyvManagerService(execDockerRedisClusterService)
                        return {
                            autoSchemaFile: {
                                federation: 2,
                            },
                            cache: keyvManager.createKeyvAdapter(),
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
                        }
                    }
                })
            ],
            providers: [],
            exports: []
        }
    }
}