import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { FruitsService } from "./fruits.service"
import { FruitId, FruitSchema } from "@src/databases"

@Resolver()
export class FruitsResolver {
    private readonly logger = new Logger(FruitsResolver.name)

    constructor(private readonly fruitService: FruitsService) {}

    @Query(() => [FruitSchema], { name: "fruits" })
    async fruits(): Promise<Array<FruitSchema>> {
        return this.fruitService.getFruits()
    }
    
    @Query(() => FruitSchema, { name: "fruit" })
    async crop(@Args("id", { type: () => ID }) id: FruitId): Promise<FruitSchema> {
        return this.fruitService.getFruit(id)
    }
}
