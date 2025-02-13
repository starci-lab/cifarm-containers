import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { ToolsService } from "./tools.service"
import { ToolSchema } from "@src/databases"

@Resolver()
export class ToolsResolver {
    private readonly logger = new Logger(ToolsResolver.name)

    constructor(private readonly toolsService: ToolsService) {}

    @Query(() => ToolSchema, {
        name: "tool",
        nullable: true
    })
    async getTool(@Args("id", { type: () => ID }) id: string): Promise<ToolSchema> {
        return this.toolsService.getTool(id)
    }

    @Query(() => [ToolSchema], {
        name: "tools"
    })
    async getTools(): Promise<Array<ToolSchema>> {
        return this.toolsService.getTools()
    }

    @Query(() => ToolSchema, {
        name: "toolByKey"
    })
    async getToolByKey(@Args("key", { type: () => String }) key: string): Promise<ToolSchema> {
        return this.toolsService.getToolByKey(key)
    }
}
