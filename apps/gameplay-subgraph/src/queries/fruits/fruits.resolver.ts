import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { FruitsService } from "./fruits.service"
import { FruitId, FruitSchema } from "@src/databases"

@Resolver()
export class FruitsResolver {
    private readonly logger = new Logger(FruitsResolver.name)

    constructor(private readonly fruitService: FruitsService) {}

    @Query(() => [FruitSchema], { name: "fruits", description: "Get all fruits" })
    async fruits(): Promise<Array<FruitSchema>> {
        return this.fruitService.getFruits()
    }
    
    @Query(() => FruitSchema, { name: "fruit", description: "Get a fruit by ID" })
    async fruit(@Args("id", { type: () => ID, description: "The ID of the fruit" }) id: FruitId): Promise<FruitSchema> {
        return this.fruitService.getFruit(id)
    }
}
