import { ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { GraphQLModule as NestGraphQLModule } from "@nestjs/graphql"
import { SubgraphOptionsFactory } from "./subgraph-options.factory"
import { SubgraphOptionsModule } from "./subgraph-options.module"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./subgraph.module-definition"

@Module({})
export class GraphQLSubgraphModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}) {
        const dynamicModule = super.forRoot(options)

        return {
            ...dynamicModule,
            imports: [
                NestGraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
                    driver: ApolloFederationDriver,
                    imports: [SubgraphOptionsModule.register()],
                    inject: [SubgraphOptionsFactory],
                    useFactory: (subgraphOptionsFactory: SubgraphOptionsFactory) =>
                        subgraphOptionsFactory.createSubgraphOptions()
                })
            ]
        }
    }
}
