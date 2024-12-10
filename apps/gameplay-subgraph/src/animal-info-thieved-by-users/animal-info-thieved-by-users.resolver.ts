import { AnimalInfoThievedByUsersService } from "@apps/gameplay-subgraph/src/animal-info-thieved-by-users/animal-info-thieved-by-users.service"
import { Logger } from "@nestjs/common"
import { Resolver } from "@nestjs/graphql"

@Resolver()
export class AnimalInfoThievedByUsersResolver {
    private readonly logger = new Logger(AnimalInfoThievedByUsersResolver.name)

    constructor(
        private readonly animalInfoThiefedByUsersService: AnimalInfoThievedByUsersService
    ) {}
}
