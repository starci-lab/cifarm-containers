import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { AnimalsService } from "./animals.service"
import { AnimalEntity } from "@src/databases"
import { GetAnimalsArgs } from "./animals.dto"

@Resolver()
export class AnimalsResolver {
    private readonly logger = new Logger(AnimalsResolver.name)

    constructor(private readonly animalsService: AnimalsService) {}

    @Query(() => [AnimalEntity], {
        name: "animals"
    })
    async getAnimals(@Args("args") args: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        return await this.animalsService.getAnimals(args)
    }
    @Query(() => AnimalEntity, {
        name: "animal",
        nullable: true
    })
    async getAnimal(@Args("id", { type: () => ID }) id: string): Promise<AnimalEntity> {
        return await this.animalsService.getAnimal(id)
    }
}
