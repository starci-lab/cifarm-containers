import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { AnimalsService } from "./animals.service"
import { AnimalSchema } from "@src/databases"

@Resolver()
export class AnimalsResolver {
    private readonly logger = new Logger(AnimalsResolver.name)

    constructor(private readonly animalsService: AnimalsService) {}

    @Query(() => [AnimalSchema], {
        name: "animals"
    })
    async getAnimals(): Promise<Array<AnimalSchema>> {
        return await this.animalsService.getAnimals()
    } 
    @Query(() => AnimalSchema, {
        name: "animal",
        nullable: true
    })
    async getAnimal(@Args("id", { type: () => ID }) id: string): Promise<AnimalSchema> {
        return await this.animalsService.getAnimal(id)
    }
}
