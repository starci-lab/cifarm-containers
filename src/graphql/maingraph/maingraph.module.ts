import { IntrospectAndCompose } from "@apollo/gateway"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/dist/esm/plugin/landingPage/default"
import { ApolloGatewayDriverConfig, ApolloGatewayDriver } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"
import { envConfig } from "@src/env"
import { getHttpUrl } from "@src/utils"

@Module({})
export class MaingraphModule {
    public static forRoot() {
        return {
            module: MaingraphModule,
            imports: [
                GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
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
            providers: [],
            exports: []
        }
    }
}