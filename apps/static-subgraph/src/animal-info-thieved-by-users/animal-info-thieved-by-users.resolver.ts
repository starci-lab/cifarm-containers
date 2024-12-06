import { AnimalInfoThievedByUsersService } from "@apps/static-subgraph/src/animal-info-thieved-by-users/animal-info-thieved-by-users.service"
import { Logger } from "@nestjs/common"
import { Resolver } from "@nestjs/graphql"

@Resolver()
export class AnimalInfoThievedByUsersResolver {
    private readonly logger = new Logger(AnimalInfoThievedByUsersResolver.name)

    constructor(
        private readonly animalInfoThiefedByUsersService: AnimalInfoThievedByUsersService
    ) {}

    // @Query(() => [AnimalInfoEntity], {
    //     name: "animal_infos"
    // })
    // @UseInterceptors(TimerInterceptor, GraphQLCacheInterceptor)
    // async getAnimalInfoThiefedByUsers(@Args("args") args: GetAnimalInfoThiefedByUsersArgs): Promise<Array<AnimalInfoThiefedByUserEntity>> {
    //     const result = await this.animalInfoThiefedByUsersService.getAnimalInfoThiefedByUsers(args)
    //     return result
    // }
}
