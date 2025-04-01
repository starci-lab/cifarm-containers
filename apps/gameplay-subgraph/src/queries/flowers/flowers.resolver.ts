import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { FlowersService } from "./flowers.service"
import { FlowerSchema, FlowerId } from "@src/databases"
import { GraphQLThrottlerGuard, UseThrottlerName } from "@src/throttler"

@Resolver()
export class FlowersResolver {
    private readonly logger = new Logger(FlowersResolver.name)

    constructor(private readonly flowersService: FlowersService) {}

    @UseThrottlerName()
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [FlowerSchema], { name: "flowers", description: "Get all flowers" })
    flowers(): Array<FlowerSchema> {
        return this.flowersService.flowers()
    }
    
    @UseThrottlerName()
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => FlowerSchema, { name: "flower", description: "Get a flower by ID" })
    flower(@Args("id", { type: () => ID, description: "The ID of the flower" }) id: FlowerId): FlowerSchema {
        return this.flowersService.flower(id)
    }
}
