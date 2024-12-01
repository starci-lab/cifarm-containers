import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { ToolsService } from "./tools.service"
import { ToolEntity } from "@src/database"
import { GetToolsArgs } from "./"
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

    @Query(() => ToolEntity, {
        name: "tool",
        nullable:true
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getToolById(@Args("id") id: string): Promise<ToolEntity | null> {
        this.logger.debug(`getToolById: id=${id}`)
        return this.toolsService.getToolById(id)
    }
}
