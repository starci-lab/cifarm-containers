import { GetAnimalInfosArgs } from "./"
import { AnimalInfosService } from "@apps/gameplay-subgraph/src/animal-infos/animal-infos.service"
import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { AnimalInfoEntity } from "@src/database"

@Resolver()
export class AnimalInfosResolver {
    private readonly logger = new Logger(AnimalInfosResolver.name)

    constructor(private readonly animalInfosService: AnimalInfosService) {}
    
    @Query(() => [AnimalInfoEntity], {
        name: "animal_infos"
    })
    async getAnimalInfos(@Args("args") args: GetAnimalInfosArgs): Promise<Array<AnimalInfoEntity>> {
        const result = await this.animalInfosService.getAnimalInfos(args)
        return result
    }
    @Query(() => AnimalInfoEntity, {
        name: "animal_infos"
    })
    async getAnimalInfoById(@Args("id") id: string): Promise<AnimalInfoEntity> {
        const result = await this.animalInfosService.getAnimalInfoById(id)
        return result
    }
}
