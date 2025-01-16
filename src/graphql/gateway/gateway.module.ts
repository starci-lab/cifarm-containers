import { IntrospectAndCompose } from "@apollo/gateway"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { GraphQLModule as NestGraphQLModule } from "@nestjs/graphql"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./gateway.module-definition"
import { DefaultRemoteGraphQLDataSource } from "./default.remote-graphql-data-source"

@Module({})
export class GraphQLGatewayModule extends ConfigurableModuleClass { 
    //gateway
    public static forRoot(options: typeof OPTIONS_TYPE) {
        const subgraphs = options.subgraphs ?? []
        
        const dynamicModule = super.forRoot(options)
        return {
            ...dynamicModule,
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
                        buildService: ({ url }) => {
                            return new DefaultRemoteGraphQLDataSource({ url })
                        },
                        supergraphSdl: new IntrospectAndCompose({
                            subgraphs
                        })
                    }
                })
            ],
        }
    }
}