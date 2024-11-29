import { Module } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"
import { ApolloGatewayDriverConfig, ApolloGatewayDriver } from "@nestjs/apollo"
import { IntrospectAndCompose } from "@apollo/gateway"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
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
    ],
    providers: []
})
export class AppModule {}
