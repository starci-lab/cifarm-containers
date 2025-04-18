import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { ToolId, ToolSchema } from "@src/databases"
import { ToolsService } from "./tools.service"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class ToolsResolver {
    private readonly logger = new Logger(ToolsResolver.name)

    constructor(private readonly toolsService: ToolsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => ToolSchema, {
        name: "tool",
        description: "Get a tool by ID"
    })
    async tool(
        @Args("id", { type: () => ID, description: "The ID of the tool" }) id: ToolId
    ): Promise<ToolSchema> {
        return this.toolsService.tool(id)
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [ToolSchema], {
        name: "tools",
        description: "Get all tools"
    })
    async tools(): Promise<Array<ToolSchema>> {
        return this.toolsService.tools()
    }
}
