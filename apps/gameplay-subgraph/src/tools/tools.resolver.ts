import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { ToolsService } from "./tools.service"
import { ToolId, ToolSchema } from "@src/databases"

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
