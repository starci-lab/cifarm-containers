import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { ToolsService } from "./tools.service"
import { ToolEntity } from "@src/database"
import { GetToolsArgs } from "./tools.dto"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class ToolsResolver {
    private readonly logger = new Logger(ToolsResolver.name)

    constructor(private readonly toolsService: ToolsService) {}

    @Query(() => [ToolEntity], {
        name: "tools"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getTools(@Args("args") args: GetToolsArgs): Promise<Array<ToolEntity>> {
        this.logger.debug(`getTools: args=${JSON.stringify(args)}`)
        return this.toolsService.getTools(args)
    }
}
