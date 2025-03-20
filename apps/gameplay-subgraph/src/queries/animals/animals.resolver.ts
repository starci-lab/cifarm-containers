import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { AnimalsService } from "./animals.service"
import { AnimalId, AnimalSchema } from "@src/databases"

@Resolver()
export class AnimalsResolver {
    private readonly logger = new Logger(AnimalsResolver.name)

    constructor(private readonly animalsService: AnimalsService) {}

    
    @Query(() => [AnimalSchema], {
        name: "animals",
        description: "Get all animals"
    })
    async animals(): Promise<Array<AnimalSchema>> {
        return await this.animalsService.animals()
    } 

    @Query(() => AnimalSchema, {
        name: "animal",
        description: "Get an animal by ID",
    })
    async animal(@Args("id", { type: () => ID, description: "The ID of the animal" }) id: AnimalId): Promise<AnimalSchema> {
        return await this.animalsService.animal(id)
    }
}
