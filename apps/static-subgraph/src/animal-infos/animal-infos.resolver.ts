import { GetAnimalInfosArgs } from "@apps/static-subgraph/src/animal-infos/animal-infos.dto"
import { AnimalInfosService } from "@apps/static-subgraph/src/animal-infos/animal-infos.service"
import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { AnimalInfoEntity } from "@src/database"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"
import TimerInterceptor from "@src/interceptors/timer.interceptor"

@Resolver()
export class AnimalInfosResolver {
    private readonly logger = new Logger(AnimalInfosResolver.name)

    constructor(private readonly animalInfosService: AnimalInfosService) {
    }

    @Query(() => [AnimalInfoEntity], {
        name: "animal_infos"
    })
    @UseInterceptors(TimerInterceptor, GraphQLCacheInterceptor)
    async getAnimalInfos(@Args("args") args: GetAnimalInfosArgs): Promise<Array<AnimalInfoEntity>> {
        const result = await this.animalInfosService.getAnimalInfos(args)
        return result
    }
}
