import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
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
        const result = await this.animalsService.getAnimals(args)
        return result
    }
     @Query(() => AnimalEntity, {
         name: "animals",
         nullable:true
     })
    async getAnimalById(@Args("id") id: string): Promise<AnimalEntity> {
        const result = await this.animalsService.getAnimalById(id)
        return result
    }
}
