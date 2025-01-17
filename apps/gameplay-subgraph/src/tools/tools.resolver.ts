import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { ToolsService } from "./tools.service"
import { ToolEntity } from "@src/databases"
import { CacheControl } from "@src/decorators"

@Resolver()
export class ToolsResolver {
    private readonly logger = new Logger(ToolsResolver.name)

    constructor(private readonly toolsService: ToolsService) {}

    @CacheControl({ maxAge: 100 })
    @Query(() => ToolEntity, {
        name: "tool",
        nullable: true
    })
    async getTool(@Args("id", { type: () => ID }) id: string): Promise<ToolEntity | null> {
        return this.toolsService.getTool(id)
    }

    @CacheControl({ maxAge: 100 })
    @Query(() => [ToolEntity], {
        name: "tools"
    })
    async getTools(): Promise<Array<ToolEntity>> {
        return this.toolsService.getTools()
    }
}
