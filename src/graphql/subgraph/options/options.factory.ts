import responseCachePlugin from "@apollo/server-plugin-response-cache"
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl"
import { ApolloDriverConfig } from "@nestjs/apollo"
import { Injectable } from "@nestjs/common"
import { Int } from "@nestjs/graphql"
import { KeyvService } from "@src/cache"
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLEnumType } from "graphql"

@Injectable()
export class SubgraphOptionsFactory {
    constructor(private readonly keyvService: KeyvService) { }

    async createSubgraphOptions(): Promise<Omit<ApolloDriverConfig, "driver">> {
        const keyvAdapter = await this.keyvService.createKeyvAdapter()
        return {
            autoSchemaFile: {
                federation: 2
            },
            cache: keyvAdapter,
            plugins: [ApolloServerPluginCacheControl(), responseCachePlugin()],
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
                                        PRIVATE: {}
                                    }
                                })
                            },
                            inheritMaxAge: { type: GraphQLBoolean }
                        },
                        locations: [
                            DirectiveLocation.FIELD_DEFINITION,
                            DirectiveLocation.OBJECT,
                            DirectiveLocation.INTERFACE,
                            DirectiveLocation.UNION,
                            DirectiveLocation.QUERY
                        ]
                    })
                ]
            }
        }
    }
}