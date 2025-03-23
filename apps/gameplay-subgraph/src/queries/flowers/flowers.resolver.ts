import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { FlowersService } from "./flowers.service"
import { FlowerSchema, FlowerId } from "@src/databases"

@Resolver()
export class FlowersResolver {
    private readonly logger = new Logger(FlowersResolver.name)

    constructor(private readonly flowersService: FlowersService) {}

    @Query(() => [FlowerSchema], { name: "flowers", description: "Get all flowers" })
    async flowers(): Promise<   Array<FlowerSchema>> {
        return this.flowersService.flowers()
    }
    
    @Query(() => FlowerSchema, { name: "flower", description: "Get a flower by ID" })
    async flower(@Args("id", { type: () => ID, description: "The ID of the flower" }) id: FlowerId): Promise<FlowerSchema> {
        return this.flowersService.flower(id)
    }
}
