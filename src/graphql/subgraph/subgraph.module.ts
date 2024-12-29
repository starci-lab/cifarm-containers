import { ApolloFederationDriverConfig, ApolloFederationDriver } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"

@Module({})
export class SubgraphModule {
    public static forRoot() {
        return {
            module: SubgraphModule,
            imports: [
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
            ],
            providers: [],
            exports: []
        }
    }
}