import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { AnimalsService } from "./animals.service"
import { AnimalEntity } from "@src/database"
import { GetAnimalsArgs } from "./animals.dto"

@Resolver()
export class AnimalsResolver {
    private readonly logger = new Logger(AnimalsResolver.name)

    constructor(private readonly animalsService: AnimalsService) {}

    @Query(() => [AnimalEntity], {
        name: "animals"
    })
    async getAnimals(@Args("args") args: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        return this.animalsService.getAnimals(args)
    }
}
