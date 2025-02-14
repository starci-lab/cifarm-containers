import { Logger } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { ToolId, ToolSchema } from "@src/databases"
import { ToolsService } from "./tools.service"

@Resolver()
export class ToolsResolver {
    private readonly logger = new Logger(ToolsResolver.name)

    constructor(private readonly toolsService: ToolsService) {}

    @Query(() => ToolSchema, {
        name: "tool",
        nullable: true
    })
    async getTool(@Args("id", { type: () => ID }) id: ToolId): Promise<ToolSchema> {
        return this.toolsService.getTool(id)
    }
  
    @Query(() => [ToolSchema], {
        name: "tools"
    })
    async getTools(): Promise<Array<ToolSchema>> {
        return this.toolsService.getTools()
    }
}
