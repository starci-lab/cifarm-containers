import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { AnimalsService } from "./animals.service"
import { AnimalId, AnimalSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class AnimalsResolver {
    private readonly logger = new Logger(AnimalsResolver.name)

    constructor(private readonly animalsService: AnimalsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [AnimalSchema], {
        name: "animals",
        description: "Get all animals"
    })
    animals(): Array<AnimalSchema> {
        return this.animalsService.animals()
    } 

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => AnimalSchema, {
        name: "animal",
        description: "Get an animal by ID",
    })
    animal(@Args("id", { type: () => ID, description: "The ID of the animal" }) id: AnimalId): AnimalSchema {
        return this.animalsService.animal(id)
    }
}
