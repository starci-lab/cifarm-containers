import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { AnimalsService } from "./animals.service"
import { AnimalEntity } from "@src/database"
import { GetAnimalsArgs } from "./animals.dto"
import { Cache } from "cache-manager"
import { Inject } from "@nestjs/common"
import { CacheInterceptor } from "@nestjs/cache-manager"

@Resolver()
export class AnimalsResolver {
    private readonly logger = new Logger(AnimalsResolver.name)

    constructor(private readonly animalsService: AnimalsService
        , @Inject("CACHE_MANAGER") private cacheManager: Cache

    ) { }

    @Query(() => [AnimalEntity], {
        name: "animals"
    })
    @UseInterceptors(CacheInterceptor)
    async getAnimals(@Args("args") args: GetAnimalsArgs): Promise<Array<AnimalEntity>> {
        return this.animalsService.getAnimals(args)
    }
}
