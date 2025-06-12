import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { DecorationsService } from "./decorations.service"
import { DecorationId, DecorationSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"


@Resolver()
export class DecorationsResolver {
    private readonly logger = new Logger(DecorationsResolver.name)

    constructor(private readonly decorationsService: DecorationsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [DecorationSchema], { name: "decorations", description: "Get all decorations" })
    async decorations(): Promise<Array<DecorationSchema>> {
        return this.decorationsService.decorations()
    }   

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => DecorationSchema, { name: "decoration", description: "Get a decoration by ID" })
    decoration(@Args("id", { type: () => ID, description: "The ID of the decoration" }) id: DecorationId): DecorationSchema {
        return this.decorationsService.decoration(id)
    }
}
