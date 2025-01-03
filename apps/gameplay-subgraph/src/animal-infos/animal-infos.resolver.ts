import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { AnimalInfoEntity } from "@src/databases"
import { AnimalInfosService } from "./animal-infos.service"
import { GetAnimalInfosArgs } from "./animal-infos.dto"

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
        name: "animal_infos",
        nullable:true
    })
    async getAnimalInfoById(@Args("id") id: string): Promise<AnimalInfoEntity> {
        const result = await this.animalInfosService.getAnimalInfoById(id)
        return result
    }
}
