import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { AnimalsService } from "./animals.service"
import { AnimalEntity } from "@src/databases"
import { GetAnimalsArgs } from "./"
import { GraphQLCacheInterceptor } from "@src/graphql/interceptors/graphql-cache.interceptor"
import TimerInterceptor from "@src/interceptors/timer.interceptor"

@Resolver()
export class AnimalsResolver {
    private readonly logger = new Logger(AnimalsResolver.name)

    constructor(private readonly animalsService: AnimalsService) {}

    @Query(() => [AnimalEntity], {
        name: "animals"
    })
    @UseInterceptors(TimerInterceptor, GraphQLCacheInterceptor)
    async getAnimals(@Args("args") args: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        const result = await this.animalsService.getAnimals(args)
        return result
    }
     @Query(() => AnimalEntity, {
         name: "animals",
         nullable:true
     })
    @UseInterceptors(TimerInterceptor, GraphQLCacheInterceptor)
    async getAnimalById(@Args("id") id: string): Promise<AnimalEntity> {
        const result = await this.animalsService.getAnimalById(id)
        return result
    }
}
