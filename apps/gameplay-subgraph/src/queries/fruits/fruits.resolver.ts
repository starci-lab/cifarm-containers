import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { FruitsService } from "./fruits.service"
import { FruitId, FruitSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"


@Resolver()
export class FruitsResolver {
    private readonly logger = new Logger(FruitsResolver.name)

    constructor(private readonly fruitService: FruitsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [FruitSchema], { name: "fruits", description: "Get all fruits" })
    async fruits(): Promise<Array<FruitSchema>> {
        return this.fruitService.fruits()
    }   

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => FruitSchema, { name: "fruit", description: "Get a fruit by ID" })
    fruit(@Args("id", { type: () => ID, description: "The ID of the fruit" }) id: FruitId): FruitSchema {
        return this.fruitService.fruit(id)
    }
}
