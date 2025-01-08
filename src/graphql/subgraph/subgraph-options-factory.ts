import responseCachePlugin from "@apollo/server-plugin-response-cache"
import { ApolloServerPluginCacheControl } from "@apollo/server/dist/esm/plugin/cacheControl"
import { ApolloDriverConfig } from "@nestjs/apollo"
import { Injectable } from "@nestjs/common"
import { Int } from "@nestjs/graphql"
import { KeyvManagerService } from "@src/cache/keyv-manager.service"
import { ExecDockerRedisClusterService } from "@src/exec"
import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLEnumType } from "graphql"

@Injectable()
export class SubgraphOptionsFactory {
    constructor(
        private readonly execDockerRedisClusterService: ExecDockerRedisClusterService
    ) {}

    createSubgraphOptions(): Omit<ApolloDriverConfig, "driver"> {
        const keyvManager = new KeyvManagerService(this.execDockerRedisClusterService)
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
}