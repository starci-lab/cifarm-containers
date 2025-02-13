import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { AnimalsService } from "./animals.service"
import { AnimalId, AnimalSchema } from "@src/databases"

@Resolver()
export class AnimalsResolver {
    private readonly logger = new Logger(AnimalsResolver.name)

    constructor(private readonly animalsService: AnimalsService) {}

    @Query(() => [AnimalSchema], {
        name: "animals"
    })
    async animals(): Promise<Array<AnimalSchema>> {
        return await this.animalsService.getAnimals()
    } 

    @Query(() => AnimalSchema, {
        name: "animal",
        nullable: true
    })
    async animal(@Args("id", { type: () => ID }) id: AnimalId): Promise<AnimalSchema> {
        return await this.animalsService.getAnimal(id)
    }
}
