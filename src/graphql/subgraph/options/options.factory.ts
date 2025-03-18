import responseCachePlugin from "@apollo/server-plugin-response-cache"
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl"
import { ApolloDriverConfig } from "@nestjs/apollo"
import { Injectable } from "@nestjs/common"
import { Int } from "@nestjs/graphql"
import { KeyvService } from "@src/cache"
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLEnumType } from "graphql"
import { VoidResolver } from "graphql-scalars"
import { SubgraphOptions } from "../types"
import _ from "lodash"

@Injectable()
export class SubgraphOptionsFactory {
    constructor(private readonly keyvService: KeyvService) { }

    createSubgraphOptions(options: SubgraphOptions): Omit<ApolloDriverConfig, "driver"> {
        const keyvAdapter = this.keyvService.createKeyvAdapter()
        const { enumResolvers } = options
        let combinedEnumResolver = {}
        for (const enumResolver of enumResolvers) {
            combinedEnumResolver = _.merge(combinedEnumResolver, enumResolver)
        }
        return {
            autoSchemaFile: {
                federation: 2
            },
            resolvers: {
                Void: VoidResolver,
                ...combinedEnumResolver
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
